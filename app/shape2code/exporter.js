var json=[
  {
    "type": "shape_designer.figure.PolyRect",
    "id": "d937ec12-7bfe-0617-565c-447e72f00431",
    "x": 7934.5,
    "y": 7981,
    "width": 97,
    "height": 37,
    "alpha": 1,
    "angle": 0,
    "userData": {
      "baseClass": "draw2d.SetFigure",
      "code": "/**\n * by 'Draw2D Shape Designer'\n *\n * Custom JS code to tweak the standard behaviour of the generated\n * shape. add your custome code and event handler here.\n *\n *\n */\ntestShape = testShape.extend({\n\n    init: function(attr, setter, getter){\n         this._super(attr, setter, getter);\n\n         this.attr({resizeable:false});\n         this.installEditPolicy(new draw2d.policy.figure.AntSelectionFeedbackPolicy());\n         \n         this.value = 0;\n         var _this = this;\n         this.callback = function( msg){\n             _this.value = msg.value;\n             _this.getOutputPort(0).setValue(_this.value);\n            if(_this.value === 1){\n                _this.layerAttr(\"circle\",{fill:\"#C21B7A\"});\n            }\n            else{\n                _this.layerAttr(\"circle\",{fill:\"#f0f0f0\"});\n            }\n         }\n    },\n    \n    calculate: function()\n    {\n    },\n    \n    onStart: function()\n    {\n        socket.on(\"mqtt:message\", this.callback);\n        this.callback({value:this.value})\n    },\n\n    onStop:function()\n    {\n        socket.off(\"mqtt:message\", this.callback);\n    },\n\n});",
      "name": "circle",
      "markdown": "# High / Low Signal display\n\nsimple `HIGH`/ `LOW` display.\n\n    HIGH -> red\n \n    LOW -> gray"
    },
    "cssClass": "shape_designer_figure_PolyRect",
    "ports": [],
    "bgColor": "#919191",
    "color": "#303030",
    "stroke": 1,
    "radius": 5,
    "dasharray": null,
    "vertices": [
      {
        "x": 8031.5,
        "y": 8018
      },
      {
        "x": 7934.5,
        "y": 8018
      },
      {
        "x": 7934.5,
        "y": 7981
      },
      {
        "x": 8031.5,
        "y": 7981
      }
    ],
    "blur": 0,
    "filters": [
      {
        "name": "shape_designer.filter.PositionFilter"
      },
      {
        "name": "shape_designer.filter.SizeFilter"
      },
      {
        "name": "shape_designer.filter.StrokeFilter"
      },
      {
        "name": "shape_designer.filter.FillColorFilter"
      },
      {
        "name": "shape_designer.filter.RadiusFilter"
      }
    ]
  },
  {
    "type": "shape_designer.figure.ExtPort",
    "id": "f4d5683a-7c42-8771-5df4-e4e9da5b8b46",
    "x": 8024.3852480000005,
    "y": 7995,
    "width": 10,
    "height": 10,
    "alpha": 1,
    "angle": 0,
    "userData": {
      "name": "Port",
      "type": "Output",
      "direction": 1
    },
    "cssClass": "shape_designer_figure_ExtPort",
    "ports": [],
    "bgColor": "#1C9BAB",
    "color": "#1B1B1B",
    "stroke": 1,
    "dasharray": null,
    "filters": [
      {
        "name": "shape_designer.filter.PositionFilter"
      },
      {
        "name": "shape_designer.filter.FanoutFilter"
      },
      {
        "name": "shape_designer.filter.PortDirectionFilter"
      },
      {
        "name": "shape_designer.filter.PortTypeFilter"
      },
      {
        "name": "shape_designer.filter.FillColorFilter"
      }
    ]
  },
  {
    "type": "shape_designer.figure.ExtLabel",
    "id": "dda95266-c917-46e8-cc39-f538d0d43f73",
    "x": 7949.109375,
    "y": 7985.5,
    "width": 28.328125,
    "height": 21,
    "alpha": 1,
    "angle": 0,
    "userData": {
      "name": "Label"
    },
    "cssClass": "shape_designer_figure_ExtLabel",
    "ports": [],
    "bgColor": "none",
    "color": "#1B1B1B",
    "stroke": 0,
    "radius": 0,
    "dasharray": null,
    "text": "HiveMQ",
    "outlineStroke": 0,
    "outlineColor": "none",
    "fontSize": 16,
    "fontColor": "#FFF824",
    "fontFamily": null,
    "editor": "draw2d.ui.LabelInplaceEditor",
    "filters": [
      {
        "name": "shape_designer.filter.PositionFilter"
      },
      {
        "name": "shape_designer.filter.FontSizeFilter"
      },
      {
        "name": "shape_designer.filter.FontColorFilter"
      }
    ]
  }
];

app.fileNew();

var reader = new draw2d.io.json.Reader();
reader.unmarshal(app.view,json);

var code = null;
var img  = null;
var customCode=app.getConfiguration("code");
var markdown = app.getConfiguration("markdown");
markdown = markdown?markdown:"";
var writer = new shape_designer.FigureWriter();
try {
    writer.marshal(app.view, "testShape", function (js) {
        code = js;
        try {
            eval(js);
        }
        catch (exc) {
            console.log("Error in shape code. \nRemove error and try it again:\n\n>>    " + exc);
            throw exc;
        }
        var splash = $(
            '<div class="overlay-scale">' +
            '<div id="test_canvas">' +
            '</div>' +
            '<div>');

        // fadeTo MUSS leider sein. Man kann mit raphael keine paper.text elemente einfügen
        // wenn das canvas nicht sichtbar ist. In diesen Fall mach ich das Canvas "leicht" sichtbar und raphael ist
        // zufrieden.
        $("body").append(splash);
        var canvas = new draw2d.Canvas("test_canvas");
        var test = new testShape();
        canvas.add(test, 400, 160);
        canvas.commonPorts.each(function (i, p) {
            p.setVisible(false);
        });

        canvas.getBoundingBox = function () {
            var xCoords = [];
            var yCoords = [];
            this.getFigures().each(function (i, f) {
                var b = f.getBoundingBox();
                xCoords.push(b.x, b.x + b.w);
                yCoords.push(b.y, b.y + b.h);
            });
            var minX = Math.min.apply(Math, xCoords);
            var minY = Math.min.apply(Math, yCoords);
            var width = Math.max(10, Math.max.apply(Math, xCoords) - minX);
            var height = Math.max(10, Math.max.apply(Math, yCoords) - minY);

            return new draw2d.geo.Rectangle(minX, minY, width, height);
        };

        new draw2d.io.png.Writer().marshal(canvas, function (imageDataUrl, base64) {
            img = base64;
            splash.remove();
        }, canvas.getBoundingBox().scale(10, 10));
    });
}
catch(e){
    console.log(e);
    code="";
    img="";
}


