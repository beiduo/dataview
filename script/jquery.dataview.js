/**
 * Jquery dataView plugin
 * Author: mail@vincesnow.com
 */
//Template engine

(function ($) {
    "use strict";

    function nano(template, data) {
        return template.replace(/\{\{([\w\.]*)\}\}/g, function (str, key) {
            var i, keys = key.split("."), v = data[keys.shift()];
            for (i = 0; i < keys.length; i += 1) {
                v = v[keys[i]];
            }
            return (typeof v !== "undefined" && v !== null) ? v : "";
        });
    }

    $.fn.dataView = function (data, options) {
        /*jslint browser:true */
        /*jslint devel: true */
        /*jslint node: true */
        //If the param "data" is an object
        if (typeof data !== 'object') {
            throw new Error('the param should be an object');
        }
        
        var i,
            key,
            obj,
            html,
            tpl,
            //Default options
            defaults = {
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
            },
            //Mix the options with defaults
            opts = $.extend(defaults, data),
            extra = (typeof options === 'object') ? options : {},
            col,
            colwrap,
            tHeadwrap,
            tHeadCheckbox,
            tHeadCheckboxInner,
            tHeadCheckboxIpt,
            tHead,
            btnCtnr;

        opts.result.tpl = opts.tpl;

        //create table element
        opts.result.container = document.createElement('table');
        opts.result.container.className = 'vui-datatable';
        opts.result.container.style.width = "100%";

        for (key in opts.cols) {
            if (opts.cols.hasOwnProperty(key)) {
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
        }

        tHeadwrap = document.createElement('tr');

        if (Number(opts.batch) === 1) {
            tHeadCheckbox = document.createElement('th');
            tHeadCheckbox.className = 'vui-datatable-col-check';
            tHeadCheckboxInner = document.createElement('div');
            tHeadCheckboxInner.className = 'vui-datatable-inner';
            tHeadCheckboxIpt = document.createElement('input');
            tHeadCheckboxIpt.type = 'checkbox';
            opts.result.checkall = tHeadCheckboxIpt;
            tHeadCheckboxInner.appendChild(tHeadCheckboxIpt);
            tHeadCheckbox.appendChild(tHeadCheckboxInner);
            tHeadwrap.appendChild(tHeadCheckbox);
        }

        for (key in opts.result.cols) {
            if (opts.result.cols.hasOwnProperty(key)) {
                tHeadwrap.appendChild(opts.result.cols[key].node);
            }
        }

        tHead = document.createElement('thead');
        tHead.appendChild(tHeadwrap);

        opts.result.container.appendChild(tHead);

        //create tbody element
        opts.result.tBody = document.createElement('tbody');

        opts.result.create = function (dataItems) {
            var row,
                objRow,
                rowCols,
                fields,
                i,
                key,
                render,
                destroy,
                selfList = this;
            
            render = function (x, y) {
                var tpl,
                    fieldKey,
                    extend,
                    checkbox,
                    checkboxInner,
                    checkboxIpt,
                    self = this;

                //if tpl mode or attributes already changed
                if (typeof x === 'object') {
                    extend = x;
                } else if (typeof x === 'number') {
                    self.mode = x;
                    if (typeof y === 'object') {
                        extend = y;
                    }
                } else {
                    self.mode = 0;
                }

                //add new attributes
                for (fieldKey in extend) {
                    if (extend.hasOwnProperty(fieldKey)) {
                        self[fieldKey] = extend[fieldKey];
                    }
                }

                //if need to destroy the item
                if (typeof self.deleted !== 'undefined' && Number(self.deleted) === 1) {
                    self.destroy();
                }

                //add tracking item
                if (self.status === 'tracking') {
                    if ($.isArray(selfList.tracking)) {
                        if ($.inArray(self.key, selfList.tracking) === -1) {
                            selfList.tracking.push(self.key);
                        }
                    } else {
                        selfList.tracking = [self.key];
                    }
                } else {
                    if ($.isArray(selfList.tracking)) {
                        if ($.inArray(self.key, selfList.tracking) > -1) {
                            selfList.tracking = $.grep(selfList.tracking, function (n, i) {
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
                if (Number(opts.batch) === 1) {
                    checkbox = document.createElement('td');
                    checkbox.className = 'vui-datatable-col-check';
                    checkboxInner = document.createElement('div');
                    checkboxInner.className = 'vui-datatable-inner';
                    checkboxIpt = document.createElement('input');
                    checkboxIpt.type = 'checkbox';
                    self.checkbox = checkboxIpt;
                    checkboxInner.appendChild(checkboxIpt);
                    checkbox.appendChild(checkboxInner);

                    self.node.insertBefore(checkbox, self.node.firstChild);

                    checkboxIpt.checked = self.checked;

                    $(checkboxIpt).on('click', function () {
                        self.checked = $(this)[0].checked;
                    });
                }
            };
            
            destroy = function () {
                this.node.parentNode.removeChild(this.node);
                var itemKey = this.key;
                delete selfList.items[itemKey];
            };

            //remove all items
            selfList.tBody.innerHTML = '';

            //create each items
            for (i in dataItems) {
                if (dataItems.hasOwnProperty(i)) {
                    objRow = dataItems[i];

                    row = document.createElement('tr');
                    row.setAttribute('data-id', i);

                    objRow.mode = 0;

                    objRow.tpl = [];
                    if (typeof opts.tpl === 'string') {
                        objRow.tpl[0] = opts.tpl;
                    } else {
                        objRow.tpl = opts.tpl;
                    }

                    for (key in dataItems[i]) {
                        if (dataItems[i].hasOwnProperty(key)) {
                            objRow[key] = dataItems[i][key];
                        }
                    }

                    objRow.node = row;

                    objRow.key = i;

                    if (typeof extra.items === 'object') {
                        for (key in extra.items) {
                            if (extra.items.hasOwnProperty(key)) {
                                objRow[key] = extra.items[key];
                            }
                        }
                    }

                    if (typeof objRow.event === 'function') {
                        objRow.event();
                    }

                    //render method
                    objRow.render = render;
    
                    //destroy this item
                    objRow.destroy = destroy;
    
                    objRow.render();
    
                    selfList.items[i] = objRow;
    
                    //add new item
                    selfList.tBody.appendChild(selfList.items[i].node);
                }
            }

            selfList.container.appendChild(selfList.tBody);

            //reload
            selfList.reload = function (url) {
                //get url
                url = (typeof url === 'string') ? url : '';
                url = url || window.location.href || '';
                if (url) {
                    // clean url (don't include hash value)
                    url = (url.match(/^([^#]+)/) || [])[1];
                }

                //send request
                $.ajax({
                    type: 'get',
                    url: url,
                    dataType: 'json',
                    success: function (cb) {
                        if (cb.status === 'success') {
                            opts.result.create(cb.items);
                        }
                    }
                });
            };
        };

        opts.result.create(opts.items);

        if (typeof extra.buttons === 'object' && extra.buttons.length) {
            btnCtnr = document.createElement('div');
            btnCtnr.className = 'vui-datatable-operator';
            opts.result.buttons = $.map(extra.buttons, function (item) {
                var btn = {};
                btn.node = document.createElement('button');
                btn.node.innerHTML = item.text;
                btn.process = item.process;
                return btn;
            });
            for (i = 0; i < opts.result.buttons.length; i += 1) {
                btnCtnr.appendChild(opts.result.buttons[i].node);
                $(opts.result.buttons[i].node).on('click', opts.result.buttons[i].process);
            }
        }

        for (i = 0; i < this.length; i += 1) {
            this[i].appendChild(opts.result.container);
            if (btnCtnr.innerHTML) {
                this[i].appendChild(btnCtnr);
            }
        }

        //if requires checkbox element
        if (Number(opts.batch) === 1 && typeof opts.result.checkall !== 'undefined') {
            $(opts.result.checkall).on('click', function () {
                var key,
                    checked = $(this)[0].checked;
                for (key in opts.result.items) {
                    if (opts.result.items.hasOwnProperty(key)) {
                        if (typeof opts.result.items[key].checkbox !== 'undefined' && !opts.result.items[key].checkbox.disabled) {
                            opts.result.items[key].checkbox.checked = checked;
                            opts.result.items[key].checked = checked;
                        }
                    }
                }
            });
        }

        //tracking items
        opts.result.track = function (x) {
            var self = this;

            if (typeof x !== 'object') {
                return false;
            }

            //if there are items need to be tracked
            if ($.isArray(self.tracking) && self.tracking.length > 0) {
                //get tracking url
                x.url = (typeof x.url === 'string') ? x.url : '';
                x.url = x.url || window.location.href || '';
                if (x.url) {
                    // clean url (don't include hash value)
                    x.url = (x.url.match(/^([^#]+)/) || [])[1];
                }

                //get attr
                x.attr = (typeof x.attr === 'string') ? x.attr : 'ids';

                //send request
                $.ajax({
                    type: 'get',
                    url: x.url,
                    data: x.attr + '=' + self.tracking.join(','),
                    dataType: 'json',
                    success: function (cb) {
                        var key, i, item;
                        if (cb.status === 'success') {
                            if (typeof x.callback === 'function') {
                                cb.items = x.callback(cb.items);
                            }

                            if (typeof cb.items === 'object') {
                                for (key in cb.items) {
                                    if (cb.items.hasOwnProperty(key)) {
                                        item = self.items[key];
                                        if (typeof item === 'object') {
                                            item.render(0, cb.items[key]);
                                        }
                                    }
                                }
                            }
                        }
                    }
                });
            }
        };

        //batch
        opts.result.batch = function (x) {
            var self = this,
                items,
                data;

            //invalid arguments
            if (typeof x !== 'object' && typeof x !== 'function') {
                return false;
            }

            //collect all items that have been choosen
            items = $.map(self.items, function (item, i) {
                if (item.checked) {
                    return item;
                }
            });

            if (items.length < 1) {
                alert('please at least choose one item');
                return;
            }

            //if arguments[0] is a function
            if (typeof x === 'function') {
                x(items);
            } else {
                //if x.before is a function, run it, if it returns false, then stop here
                if (typeof x.before === 'function' && !x.before(items)) {
                    return false;
                }

                //if x.url exists, send a XMLHttpRequest
                if (typeof x.url === 'string') {

                    //get url
                    x.url = x.url || window.location.href || '';
                    if (x.url) {
                        // clean url (don't include hash value)
                        x.url = (x.url.match(/^([^#]+)/) || [])[1];
                    }
                    //get data
                    data = '';
                    if (typeof x.data === 'string') {
                        data = x.data;
                    } else if (typeof x.data === 'function') {
                        data = x.data(items);
                    }
                    //send request
                    $.ajax({
                        type: 'post',
                        url: x.url,
                        data: data,
                        dataType: 'json',
                        success: function (cb) {
                            var key, i, item;
                            if (cb.status === 'success') {
                                //if x.after is a function, run it, if itself still returns all the items, the success function will continue
                                if (typeof x.after === 'function') {
                                    cb.items = x.after(cb.items);
                                }

                                if (typeof cb.items === 'object') {
                                    for (key in cb.items) {
                                        if (cb.items.hasOwnProperty(key)) {
                                            item = self.items[key];
                                            if (typeof item === 'object') {
                                                item.render(cb.items[key]);
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    });
                }
            }
        };

        if (typeof extra.list === 'object') {
            for (key in extra.list) {
                if (extra.list.hasOwnProperty(key)) {
                    opts.result[key] = extra.list[key];
                }
            }
        }

        if (typeof opts.result.event === 'function') {
            opts.result.event();
        }

        return opts.result;

    };
}(jQuery));