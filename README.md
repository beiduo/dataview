#Dataview plugin for jQuery

Move on to Angular 1.5+

https://github.com/beiduo/ng-datatable 

***

##组件简介
***
dataview是一个提供数据视图功能的前端组件，可以根据符合格式的json数据创建视图界面，并且提供一些基本的交互行为。

在未做其他扩展或定义的情况下，dataview将在指定的dom节点内创建一个包含thead与tbody的表格视图，以及一个根据选项生成的包含附加按钮的div区块。

dataview的数据、模板与视图是相互独立的。视图部分仅用于界面显示和事件监听，视图的更改不会对数据造成影响。所以，视图上的交互行为，都是需要通过数据的变更和模板的切换来完成的。

dataview将返回一个包含一些子对象的总对象。所有的数据、模板和视图都被存储在这个对象里面

###对象的第一层包含如下属性：

container：指向整个表格的dom节点

tbody：指向tbody的dom节点

checkall：指向全选按钮的dom节点，只有在设置batch为1的时候才会生成

tracking：数组，储存标记为tracking的列表项目的键名

###方法（适用于全局数据的api）：

create()：根据参数所定义的列表数据重新生成整个列表，参数格式与data/data.json解析后生成的对象的items子对象一致

reload()：根据url重新生成整个列表数据，其实就是调用了create方法，不同的是参数直接为一个指向类似data/data.json的json数据的url即可

track()：批量跟踪已经标记为tracking的项目，参数为一个url地址和一个可选的回调函数，下面的使用方法内会详细说明。

batch()：批处理的接口，对标记为checked的项目进行批量处理，参数和使用方式在使用方法里再详细说明。

event()：通常用于事件处理，由使用者通过参数进行设置，在视图生成后将会自动被执行。设置方法在使用方法里详细说明。

###子对象

buttons：buttons为一个对象集数组，每个子对象内包含指向按钮dom节点的node属性和储存点击事件的process方法。只有在引用js时设置了按钮选项才会生成。

items：items是用于储存列表数据的对象，每一个属性的键名都是该项数据的key属性（通常为id），键值是一个子对象，子对象的属性与模板中的变量名对应。同时，子对象中也包含一些内置使用的属性和方法：

####items各子对象的内置属性包括：

checkbox：指向复选框的dom节点（如果json数据的batch值为1）

key：与上面所提到的键名相同

node：指向列表项目的dom节点

mode：当前所使用的模板编号，与tpl属性关联

tpl：储存模板的数组，数组的编号与mode相关联。通常情况下，该属性即为json数据中的tpl属性的副本

checked：是否被选中，供batch方法使用。

status：状态。通常情况下和其他属性一样为供模板引擎使用的变量，但是如果需要用到track()功能，则需要将其设置为tracking。

####items各子对象的内置方法包括：

render()：根据模板编号和数据来生成视图。可带两个参数，模板变化（数值）及需要进行覆盖的属性组成的对象。

destroy()：删除整个列表项目及其数据内容。如果需要删除一个列表项，仅删除dom节点是不行的，必须要调用这个方法。

event()：通常用于单个列表项目的事件处理，在单个列表项生成后会被自动执行，设置方法在使用方法里详细说明。

##使用方法
***

###数据准备
***

见示例（data/data.json）

    {
        "status": "success",
        "tagname": "table",
        "cols": {
            "status": {
                "name": "status"
            },
            "subject": {
                "name": "subject"
            },
            "price": {
                "name": "price"
            },
            "operator": {
                "name": "operator"
            }
        },
        "tpl": [
            "<td class=\"vui-datatable-col-status\"><div class=\"vui-datatable-inner\"><span class=\"status status-{{status}}\">{{statustext}}</span></div></td><td class=\"vui-datatable-col-subject\"><div class=\"vui-datatable-inner\"><div class=\"objectwrap\"><span class=\"thumb\"><img src =\"{{thumb}}\" alt=\"\" /></span><span class=\"title\"><a href=\"{{url}}\">{{title}}</a></span><span class=\"serialcode\">{{serialcode}}</span></div></div></td><td class=\"vui-datatable-col-price\"><div class=\"vui-datatable-inner\"><div class=\"objectwrap\">{{price}} rmb</div></div></td><td class=\"vui-datatable-col-operator\"><div class=\"vui-datatable-inner\"><div class=\"operatorwrap\"><a class=\"edit\" href=\"javascript: void(0)\">edit</a> <a class=\"delete\" href=\"javascript: void(0)\">delete</a></div></div></td>",
            "<td class=\"vui-datatable-col-status\"><div class=\"vui-datatable-inner\"><span class=\"status status-{{status}}\">{{statustext}}</span></div></td><td class=\"vui-datatable-col-subject\"><div class=\"vui-datatable-inner\"><div class=\"objectwrap\"><span class=\"thumb\"><img src =\"{{thumb}}\" alt=\"\" /></span><span class=\"title\"><a href=\"{{url}}\">{{title}}</a></span><span class=\"serialcode\">{{serialcode}}</span></div></div></td><td class=\"vui-datatable-col-price\"><div class=\"vui-datatable-inner\"><div class=\"objectwrap\"><input type=\"text\" value=\"{{price}}\" /> rmb</div></div></td><td class=\"vui-datatable-col-operator\"><div class=\"vui-datatable-inner\"><div class=\"operatorwrap\"><a class=\"save\" href=\"javascript: void(0)\">save</a> <a class=\"cancel\" href=\"javascript: void(0)\">cancel</a></div></div></td>",
            "<td class=\"vui-datatable-col-status\"><div class=\"vui-datatable-inner\"><span class=\"status status-{{status}}\">{{statustext}}</span></div></td><td class=\"vui-datatable-col-subject\"><div class=\"vui-datatable-inner\"><div class=\"objectwrap\"><span class=\"thumb\"><img src =\"{{thumb}}\" alt=\"\" /></span><span class=\"title\"><a href=\"{{url}}\">{{title}}</a></span><span class=\"serialcode\">{{serialcode}}</span></div></div></td><td class=\"vui-datatable-col-price\"><div class=\"vui-datatable-inner\"><div class=\"objectwrap\">{{price}} rmb</div></div></td><td class=\"vui-datatable-col-operator\"><div class=\"vui-datatable-inner\"><div class=\"operatorwrap\">loading...</div></div></td>"
        ],
        "batch": 1,
        "items": {
            "14395": {
                "status": "success",
                "...": "..."
            },
            "...": {...        }
    }

如果输出tagname为table，将会使用table系列标签来构建视图，否则将直接使用div

cols为表头，在这一简化版中，仅仅用来设置表头的dom节点，没有其他关联了。键值为classname，name属性则为表头文本

batch设置为1，即为每一列表项生成复选框，并在表头生成一个全选的复选框。

tpl为储存模板的数组

items为各项数据，属性值与模板变量名相对应。如果需要也可以在此处传入其他的属性对生成的列表对象相关属性进行覆盖。

###调用方法
***

    //先通过AJAX获取数据
    $.ajax({
        url: 'data/data.json',
        dataType: 'json',
        cache: false,
        success: function(data){
            //调用jquery对象的dataview方法
            var dataTable = $('#container').dataView(data, {
                //items中包含的属性和方法将会被自动添加到每个数据条目的对象中
                //此处的优先级为最高
                //注意这里定义的方法函数，上下文对象指向的是进行调用的数据条目
                items: {
                    //event函数将在数据条目生成后自动执行
                    event: function(){
                        var self = this;
    
                        //在这里可以进行一些事件监听
                        //视图的更改都要通过数据的变更和模板的切换来实现，直接更改dom节点是错误的
                        $(self.node).delegate('a', 'click', function(){
                            if ($(this).is('.delete')){
                                self.destroy();
                                return false;
                            } else if ($(this).is('.edit')){
                                self.render(1);
                                return false;
                            } else if ($(this).is('.cancel')){
                                self.render(0);
                                return false;
                            } else if ($(this).is('.save')){
                                $.ajax({
                                    url: 'data/edit.json',
                                    dataType: 'json',
                                    cache: false,
                                    success: function(data){
                                        if (data.status === 'success'){
                                            self.render(2, data.data);
                                        }
                                    }
                                });
                                return false;
                            }
                        });
                    }
                },
                //items中包含的属性和方法将会被自动添加到总对象中
                //此处的优先级为最高
                //注意这里定义的方法函数，上下文对象指向的是总对象
                list: {
                    event: function(){
                        var self = this;
    
                        //建立状态跟踪
                        //track()参数设置方法见后面的说明
                        var tracking = function(){
                            dataTable.track({
                                url: 'data/track.json',
                                callback: function(data){
                                    return data;
                                }
                            });
                            setTimeout(tracking, 5000);
                        }
    
                        setTimeout(tracking, 5000);
                    }
                },
                //设置按钮
                buttons: [
                    {
                        //按钮文本
                        text: 'delete',
                        //按钮点击事件函数，注意这里的上下文对象指向的是按钮的dom节点
                        process: function(){
                            //这是一个比较简单的批处理调用，仅设置一个回调函数作为参数
                            //items为被标记为checked的数据条目集合
                            dataTable.batch(function(items){
                                if (confirm('are you sure you want to delete all the items that have been choosen?')){
                                    for (var key in items){
                                        if (typeof items[key].destroy === 'function'){
                                            items[key].destroy();
                                        }
                                    }
                                } else {
                                    return false;
                                }
                            });
                        }
                    },
                    {
                        text: 'delete2',
                        process: function(){
                            //这是一个复杂的批处理，参数是一个对象
                            //除after()以外的函数的items参数都是被标记为checked的数据条目集合
                            dataTable.batch({
                                //先于AJAX请求执行的函数，注意，只有返回true才会继续执行ajax请求
                                before: function(items){
                                    if (confirm('are you sure you want to delete all the items that have been choosen?')){
                                        for (var key in items){
                                            items[key].render(2, {
                                                status: 'loading',
                                                statustext: 'deleting'
                                            });
                                        }
                                        return true;
                                    } else {
                                        return false;
                                    }
                                },
                                //请求的地址，只有该项为字符串的情况下，才会发送ajax请求
                                url: 'data/batch.json',
                                //获取所需发送的参数，此处是获取id字符串
                                data: function(items){
                                    var ids = $.map(items, function(item, i){
                                        return item.key;
                                    });
                                    return 'ids=' + ids.join(',');
                                },
                                //请求成功后的回调函数
                                //可选项，如果没有设置，将直接根据返回的数据执行render()
                                //注意：此处的items参数为ajax返回的数据的items子对象
                                //注意：如果此处仍然将items返回继续返回，则render()操作会继续被执行
                                after: function(items){
                                    alert(items.length);
                                    return items;
                                }
                            });
                        }
                    }
                ]
            });
        }
    });

###操作数据返回的形式
***

注意：如果要删除某一条目，将其"deleted"属性设置为1即可

####全局操作或批量操作：

    {
        "status": "success",
        "items": {
            "943522": {
                "deleted": 1,
                ....
            },
            "943522": {
                ....
            }
        }
    }

####单个条目的数据

    {
        "status": "success",
        "data": {
            "deleted": 1，
            ...
        }
    }
