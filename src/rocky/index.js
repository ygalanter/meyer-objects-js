var MINUTE_HAND_POINTS, HOUR_HAND_POINTS, SECOND_HAND_POINTS;

//moves all points of gpath array by given offset
function gpathMoveBy(gpath, cx, cy) {
  for (var i=0; i<gpath.length; i++) {
    gpath[i][0] += cx;
    gpath[i][1] += cy;
  }  
}

// rotates gpath against point (cx, cy) at angle
function gpathRotate(gpath, cx, cy, angle) {
  var gpathRotated = [];
  
  for (var i=0; i<gpath.length; i++) {
    
    // cx, cy - center of square coordinates
    // x, y - coordinates of a corner point of the square
    // theta is the angle of rotation
    
    // translate point to origin
    var tempX =  gpath[i][0] - cx;
    var tempY =  gpath[i][1] - cy;
    
    // now apply rotation
    var rotatedX = tempX*Math.cos(angle) - tempY*Math.sin(angle);
    var rotatedY = tempX*Math.sin(angle) + tempY*Math.cos(angle);
    
    // translate back
    gpathRotated.push([rotatedX + cx, rotatedY + cy]);
  
    
  }
  
  return gpathRotated;
  
}

function gpathDrawOutline(ctx, gpath, strokeColor, strokeWidth) {
  
  // Configure color and width
  ctx.lineWidth = strokeWidth;
  ctx.strokeStyle = strokeColor;
  
  // Begin drawing
  ctx.beginPath();

  // Move to the initial point
  ctx.moveTo(gpath[0][0], gpath[0][1]);
  
  //drawing gpathes
  for (var i=1; i<gpath.length; i++) {
     ctx.lineTo(gpath[i][0], gpath[i][1]);
  }
  
  // final line to start point
  ctx.lineTo(gpath[0][0], gpath[0][1]);
 
  // Stroke the line (output to display)
  ctx.stroke();
  
} 

var rocky = require('rocky');

// loading coordinates (dependng on platform)
if (rocky.watchInfo.platform == "chalk") {
 
  MINUTE_HAND_POINTS = [
        [ -3, 0 ],  
        [ 3, 0 ],   
        [ 3, -60 ],    
        [ 60, -60],    
        [ 60, 60],    
        [ -60, 60 ],        
        [ -60, -60],      
        [ -3, -60 ]      
      ];
    
    HOUR_HAND_POINTS = [
        [ -5, -60 ], 
        [ -5, 0 ],    
        [ 5, 0 ],      
        [ 5, -60 ],      
        [ 60, -60],      
        [ 60, 60],      
        [ -60, 60 ],      
        [ -60, -60 ]      
    ];
           
    SECOND_HAND_POINTS = [
        [ 0, -60 ],
        [ 0, 0 ],    
        [ 0, -60 ],      
        [ 60, -60],      
        [ 60, 60],      
        [ -60, 60 ],      
        [ -60, -60 ]      
    ];  
  
} else {
     MINUTE_HAND_POINTS = [
        [ -3, 0 ],  
        [ 3, 0 ],   
        [ 3, -50 ],    
        [ 50, -50],    
        [ 50, 50],    
        [ -50, 50 ],        
        [ -50, -50],      
        [ -3, -50 ]      
      ];
    
    HOUR_HAND_POINTS = [
        [ -5, -50 ], 
        [ -5, 0 ],    
        [ 5, 0 ],      
        [ 5, -50 ],      
        [ 50, -50],      
        [ 50, 50],     
        [ -50, 50 ],      
        [ -50, -50 ]      
    ];
           
    SECOND_HAND_POINTS = [
        [ 0, -50 ],
        [ 0, 0 ],    
        [ 0, -50 ],      
        [ 50, -50],      
        [ 50, 50],      
        [ -50, 50 ],      
        [ -50, -50 ]      
    ];  
}





var gpathMoved = false;

function fractionToRadian(fraction) {
  return fraction * 2 * Math.PI;
}



rocky.on('draw', function(event) {
  var ctx = event.context;
  var d = new Date();
  var path;

  // Clear the screen
  ctx.clearRect(0, 0, ctx.canvas.clientWidth, ctx.canvas.clientHeight);

  // Determine the width and height of the display
  var w = ctx.canvas.unobstructedWidth;
  var h = ctx.canvas.unobstructedHeight;

  // Determine the center point of the display
  var cx = w / 2;
  var cy = h / 2;
  
  // if we haven't already centered gpathes - do it
  if (!gpathMoved) {
      gpathMoveBy(MINUTE_HAND_POINTS, cx, cy);
      gpathMoveBy(HOUR_HAND_POINTS, cx, cy);
      gpathMoveBy(SECOND_HAND_POINTS, cx, cy);
      gpathMoved = true;
  }

  // Calculate the second hand angle
  var secondFraction = (d.getSeconds()) / 60;
  var secondAngle = fractionToRadian(secondFraction);
  
  // rotate seconds path
  path = gpathRotate(SECOND_HAND_POINTS, cx, cy, secondAngle);
  // drawing seconds path
  gpathDrawOutline(ctx, path, 'white', 1);

  // Calculate the minute hand angle
  var minuteFraction = (d.getMinutes()) / 60;
  var minuteAngle = fractionToRadian(minuteFraction);
  
  // rotate minutes path
  path = gpathRotate(MINUTE_HAND_POINTS, cx, cy, minuteAngle);
  // drawing minutes path
  gpathDrawOutline(ctx, path, rocky.watchInfo.platform == "diorite"? 'white' : 'yellow', 2);

  
  // Calculate the hour hand angle
  var hourFraction = (d.getHours() % 12 + minuteFraction) / 12;
  var hourAngle = fractionToRadian(hourFraction);

  // rotate hours path
  path = gpathRotate(MINUTE_HAND_POINTS, cx, cy, hourAngle);
  // drawing hours path
  gpathDrawOutline(ctx, path, rocky.watchInfo.platform == "diorite"? 'white' : 'green', 2);

  //dot in the middle
  ctx.fillStyle = rocky.watchInfo.platform == "diorite"? 'white' : 'red';
  ctx.rockyFillRadial(cx, cy, 0.1, 8, 0, 2 * Math.PI);
  ctx.fillStyle = rocky.watchInfo.platform == "diorite"? 'black' : 'darkcandyapplered';
  ctx.rockyFillRadial(cx, cy, 0.1, 3, 0, 2 * Math.PI);


});

rocky.on('secondchange', function(event) {
  // Request the screen to be redrawn on next pass
  rocky.requestDraw();
});
