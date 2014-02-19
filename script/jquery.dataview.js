/**
 * Jquery dataView plugin
 * Author: mail@vincesnow.com
 */
(function($){
    $.fn.dataView = function(data, options){
        var  i, key, obj, html, tpl;

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
        var container = document.createElement('table');
        container.className = 'vui-datatable';
        container.style.width = "100%";

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

        container.appendChild(tHead);

        //create tbody element
        var row, objRow, rowCols, fields, tBody = document.createElement('tbody');

        for (i in opts.items){
            objRow = opts.items[i];

            row = document.createElement('tr');
            row.setAttribute('data-id', i);

            objRow.mode = 0;

            objRow.tpl = []
            if (typeof opts.tpl === 'string'){
                objRow.tpl[0] = opts.tpl;
            } else {
                objRow.tpl = opts.tpl;
            }

            for (key in opts.items[i]){
                objRow[key] = opts.items[i][key];
            }

            objRow.node = row;

            if (typeof extra.items === 'object'){
                for (key in extra.items){
                    objRow[key] = extra.items[key];
                }
            }

            if (typeof objRow.event === 'function'){
                objRow.event();
            }

            objRow.render = function(x, y){
                var tpl, self = this;

                var extend;

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

                var field;
                for (var fieldKey in extend){
                    field = self;
                    field[fieldKey] = extend[fieldKey];
                }

                self.node.innerHTML = '';

                for (key in self){
                    tpl = self.tpl[Number(self.mode)];

                    html = nano(tpl, self);

                    self.node.innerHTML = html;
                }

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

            opts.result.items[i] = objRow;

            tBody.appendChild(opts.result.items[i].node);
        }

        container.appendChild(tBody);

        for (i = 0; i < this.length; i++){
            this[i].appendChild(container);
        }

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

        return opts.result;

    }
})(jQuery);