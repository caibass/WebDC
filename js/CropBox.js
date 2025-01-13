var targetPoints;
var oldImgSize = null;

const getCropBoxSize = function()
{

}

const removeCropBox = function() {
    $("#cropBox").remove();
}

const attachCropBox = function (imgWidth,imgHeight, resetDefault = false) {    

    if ($("#cropBox"))
        $("#cropBox").remove();

    if (oldImgSize && $("#cropBox") && !resetDefault)
    {
        for(i=0;i<4;i++)
        {
            targetPoints[i][0] *= imgWidth / oldImgSize.w;
            targetPoints[i][1] *= imgHeight / oldImgSize.h;
        }
    }
    else
    {
        var margin = {top: 150, right: 150, bottom: 150, left: 150};
        var width = imgWidth - margin.left - margin.right;
        var height = imgHeight - margin.top - margin.bottom;

        targetPoints = 
                [[margin.left, margin.top], 
                [width+margin.left, margin.top], 
                [width+margin.left, height+margin.top], 
                [margin.left, height+margin.top]];
    }

    oldImgSize = { w: imgWidth, h: imgHeight};
    //console.log(oldImgSize);    
    
    //targetPoints = [[150, 150], [width+150, 150], [width+150, height+150], [150, height+150]];

    var svg = d3.select("#imageDisplayArea").append("svg")
        .attr("id", "cropBox")
        .attr("width", $("#displayCanvas").width())
        .attr("height", $("#displayCanvas").height())
        .attr("style", "position: abdsolute; top: "+$("#displayCanvas").offset().top+"px; left: "+$("#displayCanvas").offset().left+"px;")
        //.attr("width", width + margin.left + margin.right)
        //.attr("height", height + margin.top + margin.bottom)
        .append("g")
        //.attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .attr("id","window_g");

    var line2 = d3.svg.line()
        .x(function(d){return d.x;})
        .y(function(d){return d.y;})
        .interpolate('linear-closed');

    svg.append('path')
        .attr({
          'id': 'croppath',
          'd': line2(MakeData(targetPoints)),
          'x': 0,
          'y': 0,
          'stroke': '#00F',
          'stroke-width': '3px',
          'fill': '#010101',
          'fill-opacity': "0.01",
          'draggable': "true"
        })
        .attr("cursor", "grab");

    var offsetX, offsetY, startPos, onDrag = false;
    var tpBak;
    svg.selectAll('#croppath').call(d3.behavior.drag()
    .on('dragstart', function(d) {
        if (onDrag == false)
        {
            startPos = d3.mouse(this);
            tpBak = JSON.stringify(targetPoints);
            onDrag = true;
        }        
    })
    .on('drag', function()  {
        var newPos = d3.mouse(this);
        offsetX = newPos[0] - startPos[0];
        offsetY = newPos[1] - startPos[1];

        var ele = $(".handle");
        var bak = JSON.parse(tpBak);
        
        for(i=0; i<4; i++)
        {        
            targetPoints[i][0] = bak[i][0] + offsetX;
            targetPoints[i][1] = bak[i][1] + offsetY;

            targetPoints[i][0] = Math.min(Math.max(targetPoints[i][0], 0), $("#displayCanvas").width())
            targetPoints[i][1] = Math.min(Math.max(targetPoints[i][1], 0), $("#displayCanvas").height())

            ele[i].setAttribute(
                "transform", 
                "translate(" + Number(targetPoints[i][0]) + "," + Number(targetPoints[i][1]) + ")");
        }

        svg.select('path')
        .attr({
          'd': line2(MakeData(targetPoints)),
          'x': 0,
          'y': 0,
          'stroke': '#00F',
          'stroke-width': '3px',
          'fill': '#010101',
          'fill-opacity': "0.01",
        });      
    })
    .on('dragend', function() { 
        onDrag = false;
    })); 

    var handle = svg.selectAll(".handle")
        .data(targetPoints)
        .enter().append("circle")
        .attr("class", "handle")
        .attr("transform", function(d) { return "translate(" + d + ")"; })
        .attr("r", 7)
        .attr("cursor", "Pointer")
        .call(d3.behavior.drag()
            .origin(function(d) {return {x: d[0], y: d[1]}; })
            .on("drag", dragged));

    function dragged(d) {
        d3.event.x = Math.min(Math.max(d3.event.x, 0), $("#displayCanvas").width());
        d3.event.y = Math.min(Math.max(d3.event.y, 0), $("#displayCanvas").height());
        d3.select(this).attr("transform", "translate(" + (d[0] = d3.event.x) + "," + (d[1] = d3.event.y) + ")");
        svg.select('path')
        .attr({
          'd': line2(MakeData(targetPoints)),
          'x': 0,
          'y': 0,
          'stroke': '#00F',
          'stroke-width': '3px',
          'fill': '#010101',
          'fill-opacity': "0.01",
        });
    }
}

const attachCropBoxFull = function (width,height) { 
    
    $("#cropBox").remove();

    targetPoints = [[0, 0], [width, 0], [width, height], [0, height]];
    
    var svg = d3.select("#imageDisplayArea").append("svg")
        .attr("id", "cropBox")
        .attr("width", $("#displayCanvas").width())
        .attr("height", $("#displayCanvas").height())
        .attr("style", "position: abdsolute; top: "+$("#displayCanvas").offset().top+"px; left: "+$("#displayCanvas").offset().left+"px;")
        //.attr("width", width + margin.left + margin.right)
        //.attr("height", height + margin.top + margin.bottom)
        .append("g")
        //.attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .attr("id","window_g");

    var line2 = d3.svg.line()
        .x(function(d){return d.x;})
        .y(function(d){return d.y;})
        .interpolate('linear-closed');

    svg.append('path')
        .attr({
          'id': 'croppath',
          'd': line2(MakeData(targetPoints)),
          'x': 0,
          'y': 0,
          'stroke': '#00F',
          'stroke-width': '3px',
          'fill': '#010101',
          'fill-opacity': "0.01",
          'draggable': "true"
        })
        .attr("cursor", "grab");

    var offsetX, offsetY, startPos, onDrag = false;
    var tpBak;
    svg.selectAll('#croppath').call(d3.behavior.drag()
    .on('dragstart', function(d) {
        if (onDrag == false)
        {
            startPos = d3.mouse(this);
            tpBak = JSON.stringify(targetPoints);
            onDrag = true;
        }        
    })
    .on('drag', function()  {
        var newPos = d3.mouse(this);
        offsetX = newPos[0] - startPos[0];
        offsetY = newPos[1] - startPos[1];

        var ele = $(".handle");
        var bak = JSON.parse(tpBak);
        
        for(i=0; i<4; i++)
        {        
            targetPoints[i][0] = bak[i][0] + offsetX;
            targetPoints[i][1] = bak[i][1] + offsetY;

            targetPoints[i][0] = Math.min(Math.max(targetPoints[i][0], 0), $("#displayCanvas").width())
            targetPoints[i][1] = Math.min(Math.max(targetPoints[i][1], 0), $("#displayCanvas").height())

            ele[i].setAttribute(
                "transform", 
                "translate(" + Number(targetPoints[i][0]) + "," + Number(targetPoints[i][1]) + ")");
        }

        svg.select('path')
        .attr({
          'd': line2(MakeData(targetPoints)),
          'x': 0,
          'y': 0,
          'stroke': '#00F',
          'stroke-width': '3px',
          'fill': '#010101',
          'fill-opacity': "0.01",
        });      
    })
    .on('dragend', function() { 
        onDrag = false;
    }));    

    var handle = svg.selectAll(".handle")
        .data(targetPoints)
        .enter().append("circle")
        .attr("class", "handle")
        .attr("transform", function(d) { return "translate(" + d + ")"; })
        .attr("r", 7)
        .attr("cursor", "Pointer")
        .call(d3.behavior.drag()
            .origin(function(d) {return {x: d[0], y: d[1]}; })
            .on("drag", dragged));

    function dragged(d) {
        d3.event.x = Math.min(Math.max(d3.event.x, 0), $("#displayCanvas").width());
        d3.event.y = Math.min(Math.max(d3.event.y, 0), $("#displayCanvas").height());
        d3.select(this).attr("transform", "translate(" + (d[0] = d3.event.x) + "," + (d[1] = d3.event.y) + ")");
        svg.select('path')
        .attr({
          'd': line2(MakeData(targetPoints)),
          'x': 0,
          'y': 0,
          'stroke': '#00F',
          'stroke-width': '3px',
          'fill': '#010101',
          'fill-opacity': "0.01",
        });
    }
}

const MakeData = function(tpt)
{
    var data = [
        {x:tpt[0][0], y:tpt[0][1]},
        {x:tpt[1][0], y:tpt[1][1]},
        {x:tpt[2][0], y:tpt[2][1]},
        {x:tpt[3][0], y:tpt[3][1]}
    ]
    return data;
}