/**
 * Jquery dataView plugin
 * Author: mail@vincesnow.com
 */
(function($){
    $.fn.dataView = function(data, options){
        var  i, key, obj, html, tpl;

        //Template engine
        function nano(template, data) {
            return template.replace(/\{\{([\w\.]*)\}\}/g, function(str, key) {
                var keys = key.split("."), v = data[keys.shift()];
                for (var i = 0, l = keys.length; i < l; i++) v = v[keys[i]];
                return (typeof v !== "undefined" && v !== null) ? v : "";
            });
        }

        //If the param "data" is an object
        if (typeof data !== 'object'){
            throw new Error('the param should be an object');
            return false;
        }

        //Default options
        var defaults = {
            status: "unknown",
            pagination: '1',
            pages: '1',
            batch: 0,
            //final object
            result: {
                //tHead
                cols: {},
                //tBody
                items: {}
            }
        };

        //Mix the options with defaults
        var opts = $.extend(defaults, data);

        var extra = (typeof options === 'object') ? options: {};

        opts.result.tpl = opts.tpl;

        //create table element
        opts.result.container = document.createElement('table');
        opts.result.container.className = 'vui-datatable';
        opts.result.container.style.width = "100%";

        //create thead element
        var col, colwrap;

        for (key in opts.cols){
            obj = {};

            obj.type = key;

            col = document.createElement('th');
            col.className = 'vui-datatable-col-' + obj.type;

            colwrap = document.createElement('div');
            colwrap.className = 'vui-datatable-inner';

            html = opts.cols[key].name;

            colwrap.innerHTML = html;

            col.appendChild(colwrap);

            obj.node = col;

            opts.result.cols[key] = obj;
        }

        var tHeadwrap = document.createElement('tr');

        if (Number(opts.batch) === 1){
            var tHeadCheckbox = document.createElement('th');
            tHeadCheckbox.className = 'vui-datatable-col-check';
            var tHeadCheckboxInner = document.createElement('div');
            tHeadCheckboxInner.className = 'vui-datatable-inner';
            var tHeadCheckboxIpt = document.createElement('input');
            tHeadCheckboxIpt.type = 'checkbox';
            opts.result.checkall = tHeadCheckboxIpt;
            tHeadCheckboxInner.appendChild(tHeadCheckboxIpt);
            tHeadCheckbox.appendChild(tHeadCheckboxInner);
            tHeadwrap.appendChild(tHeadCheckbox);
        }

        for (key in opts.result.cols){
            tHeadwrap.appendChild(opts.result.cols[key].node);
        }

        var tHead = document.createElement('thead');
        tHead.appendChild(tHeadwrap);

        opts.result.container.appendChild(tHead);

        //create tbody element
        opts.result.tBody = document.createElement('tbody');

        opts.result.create = function(dataItems){
            var row, objRow, rowCols, fields;

            var selfList = this;

            //remove all items
            selfList.tBody.innerHTML = '';

            //create each items
            for (i in dataItems){
                objRow = dataItems[i];

                row = document.createElement('tr');
                row.setAttribute('data-id', i);

                objRow.mode = 0;

                objRow.tpl = []
                if (typeof opts.tpl === 'string'){
                    objRow.tpl[0] = opts.tpl;
                } else {
                    objRow.tpl = opts.tpl;
                }

                for (key in dataItems[i]){
                    objRow[key] = dataItems[i][key];
                }

                objRow.node = row;

                objRow.key = i;

                if (typeof extra.items === 'object'){
                    for (key in extra.items){
                        objRow[key] = extra.items[key];
                    }
                }

                if (typeof objRow.event === 'function'){
                    objRow.event();
                }

                //render method
                objRow.render = function(x, y){
                    var tpl, self = this;

                    var extend;

                    //if tpl mode or attributes already changed
                    if (typeof x === 'object'){
                        extend = x;
                    } else if (typeof x === 'number'){
                        self.mode = x;
                        if (typeof y === 'object'){
                            extend = y;
                        }
                    } else {
                        self.mode = 0;
                    }

                    //add new attributes
                    for (var fieldKey in extend){
                        self[fieldKey] = extend[fieldKey];
                    }

                    //add tracking item
                    if (self.status === 'tracking'){
                        if ($.isArray(selfList.tracking)){
                            if ($.inArray(self.key, selfList.tracking) === -1){
                                selfList.tracking.push(self.key);
                            }
                        } else {
                            selfList.tracking = [self.key];
                        }
                    } else {
                        if ($.isArray(selfList.tracking)){
                            if ($.inArray(self.key, selfList.tracking) > -1){
                                selfList.tracking = $.grep(selfList.tracking, function(n, i){
                                    return n !== self.key;
                                });
                            }
                        }
                    }

                    //remove current innerhtml
                    self.node.innerHTML = '';

                    //use the template engine to create new innerhtml
                    //for (key in self){
                    tpl = self.tpl[Number(self.mode)];

                    html = nano(tpl, self);

                    self.node.innerHTML = html;
                    //}

                    //if requires checkbox element
                    if (Number(opts.batch) === 1){
                        var checkbox = document.createElement('td');
                        checkbox.className = 'vui-datatable-col-check';
                        var checkboxInner = document.createElement('div');
                        checkboxInner.className = 'vui-datatable-inner';
                        var checkboxIpt = document.createElement('input');
                        checkboxIpt.type = 'checkbox';
                        self.checkbox = checkboxIpt;
                        checkboxInner.appendChild(checkboxIpt);
                        checkbox.appendChild(checkboxInner);

                        self.node.insertBefore(checkbox, self.node.firstChild);

                        checkboxIpt.checked = self.checked;

                        $(checkboxIpt).on('click', function(){
                            self.checked = $(this)[0].checked;
                        });
                    }
                }

                objRow.render();

                selfList.items[i] = objRow;

                //add new item
                selfList.tBody.appendChild(selfList.items[i].node);
            }

            selfList.container.appendChild(selfList.tBody);

            //reload
            selfList.reload = function(url){
                //get url
                var url = (typeof url === 'string') ? url : '';
                url = url || window.location.href || '';
                if (url) {
                    // clean url (don't include hash value)
                    url = (url.match(/^([^#]+)/)||[])[1];
                }

                //send request
                $.ajax({
                    type: 'get',
                    url: url,
                    dataType: 'json',
                    success: function(cb){
                        if (cb.status === 'success'){
                            opts.result.create(cb.items);
                        }
                    }
                });
            }
        };

        opts.result.create(opts.items);

        for (i = 0; i < this.length; i++){
            this[i].appendChild(opts.result.container);
        }

        //if requires checkbox element
        if (Number(opts.batch) === 1 && typeof opts.result.checkall !== 'undefined'){
            $(opts.result.checkall).on('click', function(){
                var checked = $(this)[0].checked;
                for (key in opts.result.items){
                    if (typeof opts.result.items[key].checkbox !== 'undefined' && !opts.result.items[key].checkbox.disabled){
                        opts.result.items[key].checkbox.checked = checked;
                        opts.result.items[key].checked = checked;
                    }
                }
            });
        }

        //tracking items
        opts.result.track = function(x, y, z){
            var self = this;

            //if there are items need to be tracked
            if ($.isArray(self.tracking) && self.tracking.length > 0){
                //get tracking url
                var url = (typeof x === 'string') ? x : '';
                url = url || window.location.href || '';
                if (url) {
                    // clean url (don't include hash value)
                    url = (url.match(/^([^#]+)/)||[])[1];
                }

                //get attr
                var attr = (typeof y === 'string') ? y : 'ids';
                var data = attr + '=' + self.tracking.join(',');

                //get callback function
                var callback;
                if (typeof y === 'function'){
                    callback = y;
                } else if (typeof z === 'function'){
                    callback = z;
                }

                //send request
                $.ajax({
                    type: 'get',
                    url: url,
                    data: data,
                    dataType: 'json',
                    success: function(cb){
                        var key, i, item;
                        if (cb.status === 'success'){
                            if (typeof callback === 'function'){
                                cb.items = callback(cb.items);
                            }

                            if (typeof cb.items === 'object'){
                                for (key in cb.items){
                                    item = self.items[key];
                                    if (typeof item === 'object'){
                                        item.render(cb.items[key]);
                                    }
                                }
                            }
                        }
                    }
                });
            }
        };

        //batch
        opts.result.batch = function(x, y, z){
            var self = this;

            var ids = $.map(self.items, function(item, i){
                if (item.checked){
                    return item.key;
                }
            }).split(',');

            //get url
            var url = (typeof x === 'string') ? x : '';
            url = url || window.location.href || '';
            if (url) {
                // clean url (don't include hash value)
                url = (url.match(/^([^#]+)/)||[])[1];
            }

            //get attr
            var attr = (typeof y === 'string') ? y : 'ids';
            var data = attr + '=' + ids;

            //get callback function
            var callback;
            if (typeof y === 'function'){
                callback = y;
            } else if (typeof z === 'function'){
                callback = z;
            }

            //send request
            $.ajax({
                type: 'get',
                url: url,
                data: data,
                dataType: 'json',
                success: function(cb){
                    var key, i, item;
                    if (cb.status === 'success'){
                        if (typeof callback === 'function'){
                            cb.items = callback(cb.items);
                        }

                        if (typeof cb.items === 'object'){
                            for (key in cb.items){
                                item = self.items[key];
                                if (typeof item === 'object'){
                                    item.render(cb.items[key]);
                                }
                            }
                        }
                    }
                }
            });
        };

        if (typeof extra.list === 'object'){
            for (key in extra.list){
                opts.result[key] = extra.list[key];
            }
        }

        if (typeof opts.result.event === 'function'){
            opts.result.event();
        }

        return opts.result;

    }
})(jQuery);