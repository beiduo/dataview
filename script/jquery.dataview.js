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

        //create table element
        var container = document.createElement('table');
        container.className = 'vui-datatable';
        container.style.width = "100%";

        //create thead element
        var col, colwrap;

        for (key in opts.cols){
            obj = {};

            obj.tpl = opts.cols[key].tpl || '{{value}}';
            obj.padding = opts.cols[key].padding || '0';
            obj.align = opts.cols[key].align || 'left';
            obj.vlign = opts.cols[key].vlign || 'top';
            obj.type = key;

            col = document.createElement('th');
            col.className = 'vui-datatable-col-' + obj.type;
            col.style.textAlign = obj.align;
            col.style.verticalAlign = obj.vlign;

            colwrap = document.createElement('div');
            colwrap.className = 'vui-datatable-inner';
            colwrap.style.padding = obj.padding;

            html = opts.cols[key].name;

            colwrap.innerHTML = html;

            col.appendChild(colwrap);

            obj.node = col;

            opts.result.cols[key] = obj;
        }

        var tHeadwrap = document.createElement('tr');

        for (key in opts.result.cols){
            tHeadwrap.appendChild(opts.result.cols[key].node);
        }

        var tHead = document.createElement('thead');
        tHead.appendChild(tHeadwrap);

        container.appendChild(tHead);

        //create tbody element
        var row, objRow, rowCols, fields, tBody = document.createElement('tbody');

        for (i in opts.items){
            objRow = {
                id: i,
                cols: {}
            };

            row = document.createElement('tr');
            row.setAttribute('data-id', opts.items[i].id);

            fields = opts.items[i].fields;

            for (num in fields){
                obj = {}

                obj.type = opts.result.cols[num].type;
                obj.tpl = opts.result.cols[num].tpl;
                obj.align = opts.result.cols[num].align;
                obj.vlign = opts.result.cols[num].vlign;
                obj.padding = opts.result.cols[num].padding;

                obj.tpl = [];
                if (typeof opts.result.cols[num].tpl === 'string'){
                    obj.tpl[0] = opts.result.cols[num].tpl;
                } else {
                    obj.tpl = opts.result.cols[num].tpl;
                }

                obj.mode = '0';

                for (key in fields[num]){
                    obj[key] = fields[num][key];
                }

                objRow.cols[num] = obj
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

            objRow.render = function(){
                var self = this;

                self.node.innerHTML = '';

                for (key in self.cols){
                    col = document.createElement('td');
                    col.className = 'vui-datatable-col-' + self.cols[key].type;
                    col.style.textAlign = self.cols[key].align;
                    col.style.verticalAlign = self.cols[key].vlign;

                    colwrap = document.createElement('div');
                    colwrap.className = 'vui-datatable-inner';
                    colwrap.style.padding = self.cols[key].padding;

                    tpl = self.cols[key].tpl[Number(self.cols[key].mode)];

                    html = nano(tpl, self.cols[key]);

                    colwrap.innerHTML = html;

                    col.appendChild(colwrap);

                    self.cols[key].node = col;

                    self.node.appendChild(self.cols[key].node);
                }
            }

            objRow.render();

            opts.result.items[i] = objRow;

            tBody.appendChild(objRow.node);
        }

        container.appendChild(tBody);

        for (i = 0; i < this.length; i++){
            this[i].appendChild(container);
        }

        return opts.result;

    }
})(jQuery);