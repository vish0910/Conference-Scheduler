//
// SAGE2 application: ConferenceScheduler
// by: Vishal Doshi <vdoshi3@uic.edu>
//
// Copyright (c) 2015
//
//Git Curent Branch: grid1


var ConferenceScheduler = SAGE2_App.extend( {
	init: function(data) {
		// Create div into the DOM
		this.SAGE2Init("div", data);
		// Set the background to black
		this.element.style.backgroundColor = 'black';

		//Create user interartion 
		this.userInteraction = {};

		// move and resize callbacks
		this.resizeEvents = "continuous";
		this.moveEvents   = "continuous";


		this.numberOfDays = 3;
		this.numberOfHalls = 3;
		this.numberOfSessions = 6;

		this.themeNames = ["Robotics","Visualiztion"];
		//Colors for Sticky
		this.stickyColor = {"Robotics":"#FEBB32","Visualization":"#8EE13E"};

		//Grid variables
		this.numberOfRows = this.numberOfSessions;
		this.numberOfColumns =  this.numberOfDays * this.numberOfHalls;

		//Sticky variables
		this.numberOfThemes = 5;
		this.stickyReservoirRatio = 4;

		//Division ratio
		this.gridWRatio = 0.7;
		this.gridHRatio = 0.8;

		//Button Width and Height

		this.buttonW = 50;
		this.buttonH = 25;

		//Post-it Width and Height
		this.postItW = 50;
		this.postItH = 25;

		//Get the Window height and width
		this.mainDivW = parseInt(this.element.style.width,  10);
		this.mainDivH = parseInt(this.element.style.height, 10);

		//Calculating SVG viewport width and height
		//UPDATE REQUIRED: make sure the aspect ratio when the the window is resized, and refreshed.
		this.paper_mainW = 1000; 
		this.paper_mainH = (this.paper_mainW * (this.mainDivH / this.mainDivW));

		this.paper_gridXEnd = this.paper_mainW * this.gridWRatio;
		this.paper_gridYEnd = this.paper_mainH * this.gridHRatio;

		

		//Calling personal methods

		// this.readPaperList();
	
		this.createSnapPaper();
		this.createPartitions();
		this.intializeGrid();
		this.intializeSticky();
		this.intializeControl();

		




		// SAGE2 Application Settings
		//
		// Control the frame rate for an animation application
		this.maxFPS = 2.0;
		// Not adding controls but making the default buttons available
		this.controls.finishedAddingControls();
		this.enableControls = true;
	},
//==> PLay Area
	readPaperList: function(){
		var _this = this;
		readFile(this.resrcPath+"paperlist.json", function(err,data){
			if (err) throw err;
			else{
			console.log("ReadData"+ data);
			_this.intializePostIts(data);
			}
  			// return data;
  		}, "JSON");
	},

	intializePostIts: function(paperlist){
		//Getting ends of grid section
		var paper_gridXEnd = this.paper_gridXEnd;
		var paper_gridYEnd = this.paper_gridYEnd;

		//Getting svg bounds
		var paper_mainW = this.paper_mainW;
		var paper_mainH = this.paper_mainH;

		//Getting the size of sticky section
		var paper_stickyW = paper_mainW - paper_gridXEnd;
		var paper_stickyH = paper_mainH;

		//Creating table
		//Varibles for looping
		var i;
		var j;

		//Holds the width and height of cell

		var oldCellW = paper_stickyW/(this.stickyReservoirRatio+1); //Calculating the width of theme cell
		var cellW = oldCellW;
		// var cellH = paper_stickyH/this.numberOfThemes;
		var cellH = parseInt(Math.min(paper_stickyH/this.numberOfThemes,cellW*1.5),10);
		var stickyReservoirW = cellW * (this.stickyReservoirRatio);

		//Holds location where the rectangle has to be created
		var cellX = paper_gridXEnd;
		var cellY = 0;

		//Create an array of stickies
		this.array_sticky = [];
		//Create Array of Sticky objects
		this.sticky_object_array = [];

		if(paperlist != null){
			console.log("DATA"+ paperlist[1].date);
			for(var key = 0; key < paperlist.length ; key++){
				console.log("From postit"+ paperlist[key]["Title"]);

				var title = paperlist[key]["Title"];
				var speaker = paperlist[key]["Speaker"];
				var theme = paperlist[key]["Theme"];

				var k;

				for(k = 0; k < this.themeNames.length;k++){
					if(this.themeNames[k] == theme){
						break;
					}
				}

				var themeContainerID = k;

				var sticky_x1 =  paper_gridXEnd+oldCellW;
				var sticky_y1 =  cellH*1;
				var sticky_x2 =  sticky_x1+this.postItW;
				var sticky_y2 =  sticky_y1+ this.postItH;
				var array_sticky = this.array_sticky;
				array_sticky.push([sticky_x1,sticky_y1,sticky_x2,sticky_y2]);
				

				//Creating a sticky
				this.sticky_1= this.paper_main.rect(array_sticky[0][0],array_sticky[0][1],this.postItW,this.postItH).attr({fill: "Pink"});

				//Pushing into sticky object
				this.sticky_object_array.push(this.sticky_1);


			}
		}

	},


	createSnapPaper: function(){
		//Getting Main Window Pixel Value
		var mainDivW = this.mainDivW;
		var mainDivH = this.mainDivH;

		var paper_mainW = this.paper_mainW;
		var paper_mainH = this.paper_mainH;

		//Creating a snap paper.
		this.paper_main= new Snap(paper_mainW,paper_mainH).attr({ 
			viewBox: "0 0 "+ paper_mainW.toString()+ " "+ paper_mainH,
  			width:   mainDivW,
  			//height:  parseInt(2.6*grid, 10) // DONOT DELETE For future reference
  			height:  mainDivH,
  			// preserveAspectRatio: "xMinYMin meet" //For top left. Default is center.
		});

		//Add the snap container to the div
		this.element.appendChild(this.paper_main.node);
	},

	createPartitions: function(){
		//Getting ends of grid section
		var paper_gridXEnd = this.paper_gridXEnd;
		var paper_gridYEnd = this.paper_gridYEnd;

		//Getting svg bounds
		var paper_mainW = this.paper_mainW;
		var paper_mainH = this.paper_mainH;

		//Drawing Rectangles for each section

		//Section 1: Grid
		this.rect_grid = this.paper_main.rect(0,0,paper_gridXEnd,paper_gridYEnd).attr({
			fill:        "rgba(68, 48, 255, 0.15)",
			stroke:      "rgba(68, 48, 255, 0.80)",
			strokeWidth: 3
		});

		//Section 2: Sticky
		this.rect_sticky = this.paper_main.rect(paper_gridXEnd,0,paper_mainW -paper_gridXEnd,paper_mainH).attr({
			fill:        "rgba(68, 48, 255, 0.15)",
			stroke:      "rgba(68, 48, 255, 0.80)",
			strokeWidth: 3
		});

		//Section 3: Control
		this.rect_control = this.paper_main.rect(0,paper_gridYEnd,paper_gridXEnd,paper_mainH - paper_gridYEnd).attr({
			fill:        "rgba(68, 48, 255, 0.15)",
			stroke:      "rgba(68, 48, 255, 0.80)",
			strokeWidth: 3
		});

		//Testing how gropping works
		this.g_partition = this.paper_main.g();
		this.g_partition.add(this.rect_grid, this.rect_sticky, this.rect_control);

	},

	intializeGrid: function(){
		//Getting ends of grid section
		var paper_gridXEnd = this.paper_gridXEnd;
		var paper_gridYEnd = this.paper_gridYEnd;

		//Getting svg bounds
		var paper_mainW = this.paper_mainW;
		var paper_mainH = this.paper_mainH;

		var paper_tableX1 = paper_gridXEnd * 0.2;
		var paper_tableX2 = paper_gridXEnd *(1-0.1);
		var paper_tableY1 = paper_gridYEnd * 0.3;
		var paper_tableY2 = paper_gridYEnd*(1-0.1);

		var paper_tableW = paper_tableX2 - paper_tableX1;
		var paper_tableH = paper_tableY2 - paper_tableY1;


		//Creating table
		//Varibles for looping
		var i;
		var j;

		var cellW = paper_tableW/this.numberOfDays;
		var cellH = parseInt(Math.min(paper_tableH/this.numberOfRows, cellW),10);
		var dayH = cellW*0.25;

		var cellX = paper_tableX1;
		var cellY = paper_tableY1 - cellH - dayH;

		//Variables to hold coordinates of image rectangle
		var imgX;
		var imgY;
		var imgW;
		var imgH;


		//Creating group of headers
		this.g_gridHeaders = this.paper_main.g();

		//Printing Day1, Day2 etc.
		for(var k = 0;k<this.numberOfDays;k++){
			this.dayPartition = this.paper_main.line(cellX, cellY,cellX,paper_tableY2).attr({ stroke: "Pink", strokeWidth: 4});
			this.headRect = this.paper_main.rect(cellX, cellY, cellW, dayH).attr({
				fill:        "rgba(68, 48, 255, 0.15)",
				stroke:      "rgba(68, 48, 255, 0.80)",
				strokeWidth: 3
				});
			//Add header to the group
			this.g_gridHeaders.add(this.headRect);
			this.g_gridHeaders.add(this.dayPartition);
			cellX += cellW;
		}
		//Drawing the last line and add it to the group
		this.dayPartition = this.paper_main.line(cellX, cellY,cellX,paper_tableY2).attr({ stroke: "Pink", strokeWidth: 4});
		this.g_gridHeaders.add(this.dayPartition);


		

		

		//Holds the width and height of cell
		cellW = paper_tableW/this.numberOfColumns;
		cellH = parseInt(Math.min(paper_tableH/this.numberOfRows, cellW),10);

		var sessionW = cellW*2;



		cellX = paper_tableX1-sessionW;
		cellY = paper_tableY1;

		//Session
		for(var k = 0;k<this.numberOfSessions;k++){
			
			this.sessionRect = this.paper_main.rect(cellX, cellY, sessionW, cellH).attr({
				fill:        "rgba(68, 48, 255, 0.15)",
				stroke:      "rgba(68, 48, 255, 0.80)",
				strokeWidth: 3
				});
			//Add header to the group
			this.g_gridHeaders.add(this.sessionRect);
			cellY += cellH;
		}

		
		//Halls
		//Holds location where the rectangle has to be created
		cellX = paper_tableX1;
		cellY = paper_tableY1-cellH;


		//Start the loop to print hall names
		for(var k = 0; k< this.numberOfColumns; k++){
			this.hallRect = this.paper_main.rect(cellX, cellY, cellW, cellH).attr({
				fill:        "rgba(68, 48, 255, 0.15)",
				stroke:      "rgba(68, 48, 255, 0.80)",
				strokeWidth: 3
				});
			//Add header to the group
			this.g_gridHeaders.add(this.hallRect);
			cellX += cellW;
		}

		//Print image rect
		imgW = sessionW;
		imgH = dayH+cellH;
		imgX = paper_tableX1 - imgW;
		imgY = paper_tableY1 - imgH;
		this.imgRect = this.paper_main.rect(imgX, imgY, imgW, imgH).attr({
				fill:        "rgba(68, 48, 255, 0.15)",
				// stroke:      "rgba(68, 48, 255, 0.80)",
				stroke: "Yellow",
				strokeWidth: 1
				});
		this.g_gridHeaders.add(this.imgRect);


		//Holds location where the rectangle has to be created
		cellX = paper_tableX1;
		// var cellY = 0;

		//If you want the grid to be in center
		// var cellY = paper_gridYEnd*0.35;
		cellY = paper_tableY1;



		//Create a group for grid cell
		this.g_gridcells = this.paper_main.g();

		//Loop that creates rectangles
		for(i = 0;i<this.numberOfRows;i++){
			for(j=0;j<this.numberOfColumns;j++ ){
				//For reference : Paper.rect(x,y,width,height,[rx],[ry])
				this.cellRect = this.paper_main.rect(cellX, cellY, cellW, cellH).attr({
				fill:        "rgba(68, 48, 255, 0.15)",
				stroke:      "rgba(68, 48, 255, 0.80)",
				strokeWidth: 2
				});
				//Add the cell to group
				this.g_gridcells.add(this.cellRect);
				//Update value of the x-coordinate
				cellX +=cellW;
			}
			//Update value of the y-coordinate
			cellY += cellH;
			//Reset Value of x-coordinate
			cellX = paper_tableX1;
		}//End of loop that creates rectangles


		// this.g_gridcells.attr({
		// 	fill: "rgba(40, 55, 55, 0.85)"
		// });

	},

	intializeSticky: function(){
		//Getting ends of grid section
		var paper_gridXEnd = this.paper_gridXEnd;
		var paper_gridYEnd = this.paper_gridYEnd;

		//Getting svg bounds
		var paper_mainW = this.paper_mainW;
		var paper_mainH = this.paper_mainH;

		//Getting the size of sticky section
		var paper_stickyW = paper_mainW - paper_gridXEnd;
		var paper_stickyH = paper_mainH;

		//Creating table
		//Varibles for looping
		var i;
		var j;

		//Holds the width and height of cell

		var oldCellW = paper_stickyW/(this.stickyReservoirRatio+1); //Calculating the width of theme cell
		var cellW = oldCellW;
		// var cellH = paper_stickyH/this.numberOfThemes;
		var cellH = parseInt(Math.min(paper_stickyH/this.numberOfThemes,cellW*1.5),10);
		var stickyReservoirW = cellW * (this.stickyReservoirRatio);

		//Holds location where the rectangle has to be created
		var cellX = paper_gridXEnd;
		var cellY = 0;

		//Loop that creates rectangles
		for(i = 0;i<this.numberOfThemes;i++){
			for(j=0;j<2;j++ ){
				//For reference : Paper.rect(x,y,width,height,[rx],[ry])
				this.cellRect = this.paper_main.rect(cellX, cellY, cellW, cellH).attr({
				fill:        "rgba(68, 48, 255, 0.15)",
				stroke:      "rgba(68, 48, 255, 0.80)",
				strokeWidth: 3
				});

				//Update value of the x-coordinate
				cellX += cellW;
				cellW = stickyReservoirW; 
			}
			//Update value of the y-coordinate
			cellY += cellH;
			//Reset Value of x-coordinate
			cellX = paper_gridXEnd;
			//Reset the width to old
			cellW = oldCellW;
		}//End of loop that creates rectangles

		cellY = 0;


		// //Create an array of stickies
		// this.array_sticky = [];
		// var sticky_x1 =  paper_gridXEnd+oldCellW;
		// var sticky_y1 =  cellH*1;
		// var sticky_x2 =  sticky_x1+this.postItW;
		// var sticky_y2 =  sticky_y1+ this.postItH;
		// this.array_sticky.push([sticky_x1,sticky_y1,sticky_x2,sticky_y2]);
		// var array_sticky = this.array_sticky;

		// //Creating a sticky
		
		// this.sticky_1= this.paper_main.rect(array_sticky[0][0],array_sticky[0][1],this.postItW,this.postItH).attr({
		// 	fill: "Pink"
		// });

		// this.sticky_object_array = [];
		// this.sticky_object_array.push(this.sticky_1);
		// this.sticky_1_text = this.paper_main.text

	},

	intializeControl: function(){
		//Getting ends of grid section
		var paper_gridXEnd = this.paper_gridXEnd;
		var paper_gridYEnd = this.paper_gridYEnd;

		//Getting svg bounds
		var paper_mainW = this.paper_mainW;
		var paper_mainH = this.paper_mainH;

		//Getting size of control
		var paper_controlW = paper_gridXEnd;
		var paper_controlH = paper_mainH - paper_gridYEnd;

		this.button_floorPlan = this.paper_main.rect(10,paper_gridYEnd+10,this.buttonW,this.buttonH).attr({
			fill: "Pink",
			stroke: "#000000"
		});



	},


//<== Play Area ends
	load: function(date) {
		console.log('ConferenceScheduler> Load with state value', this.state.value);
		this.refresh(date);
	},

	draw: function(date) {
		console.log('ConferenceScheduler> Draw with state value', this.state.value);
	},

	resize: function(date) {

		//Get the Window height and width
		var mainDivW = parseInt(this.element.style.width,  10);
		var mainDivH = parseInt(this.element.style.height, 10);

		//Resizing the snap grid paper
		this.paper_main.attr({
  			width: mainDivW,
  			height: mainDivH
  		});

  		//Updating main window width and height 
		this.mainDivW = mainDivW;
		this.mainDivH = mainDivH;

		//Refreshing
		this.refresh(date);
	},
	move: function(date) {
		this.refresh(date);
	},

	quit: function() {
		// Make sure to delete stuff (timers, ...)
	},

//==> Play Area
	findStickyId: function(paperX,paperY){
		var array_sticky_size = this.array_sticky.length;
		console.log("Array length:"+array_sticky_size);
		var i;
		var result = null;
		var array_sticky = this.array_sticky;
		for(i=0;i<array_sticky_size;i++){
			if(paperX >= array_sticky[i][0] && paperX < array_sticky[i][2] && paperY >= array_sticky[i][1] && paperY < array_sticky[i][3]){
				result = i;
				break;
			}
		}
		return result;
	},


//End of Play Area



	event: function(eventType, position, user, data, date) {
		

		var mainDivW = this.mainDivW;
		var mainDivH = this.mainDivH;

		//Getting ends of grid section
		var paper_gridXEnd = this.paper_gridXEnd;
		var paper_gridYEnd = this.paper_gridYEnd;

		//Getting svg bounds
		var paper_mainW = this.paper_mainW;
		var paper_mainH = this.paper_mainH;

		//Getting the size of sticky section
		var paper_stickyW = paper_mainW - paper_gridXEnd;
		var paper_stickyH = paper_mainH;

		//Getting size of control
		var paper_controlW = paper_gridXEnd;
		var paper_controlH = paper_mainH - paper_gridYEnd;

		var x = position.x;
		var y = position.y;

		//Converting real co-ordinates to paper co-ordinates
		var paperX = (x/mainDivW) * paper_mainW;
		var paperY = (y/mainDivH) * paper_mainH;

					//Creatin a new user object if it doesnot exists
		if (this.userInteraction[user.id] === undefined) {
			this.userInteraction[user.id] = {dragging: false, position: {x: 0, y: 0}, stickyId: null};
		}

		if (eventType === "pointerPress" && (data.button === "left")) {


			// console.log("User:"+JSON.stringify(user));


			if( paperX >= 0 && paperX < paper_gridXEnd && paperY>=0 && paperY<=paper_gridYEnd){ // Grid Section
				console.log("Clicked in Grid Section("+ x + ","+ y +")");
			}
			else if(paperX >= paper_gridXEnd && paperX < paper_mainW && paperY>=0 && paperY<=paper_mainH){ // Sticky Section
				console.log("Clicked in Sticky Section("+ x+ ","+ y +")");

				var stickyId = this.findStickyId(paperX,paperY);
				console.log("Returned: "+ stickyId);
				if(stickyId != null){
					console.log("Not Null");
					this.userInteraction[user.id].dragging = true;
					this.userInteraction[user.id].position.x = position.x
					this.userInteraction[user.id].position.y = position.y;
					this.userInteraction[user.id].stickyId = stickyId;
					console.log("User: ->"+ JSON.stringify(this.userInteraction[user.id]));
				}
				//Printing All users
				// for(key in this.userInteraction){
				// 	console.log("User: "+ key + "->"+ JSON.stringify(this.userInteraction[key]));
				// }

			}
			else if(paperX >= 0 && paperX < paper_controlW && paperY >=paper_gridYEnd && paperY <=paper_mainH){ // Control Section
				console.log("Clicked in Control Section("+ x + ","+ y +")");
				
				// var offsetY = 0.15 * paper_controlH; //0.15 is half of 0.3 which is 1 - 0.70
				if(paperX >= 10 && paperX < this.buttonW+10 && paperY >= 10+paper_gridYEnd  && paperY < paper_gridYEnd+this.buttonH+10){
					console.log("ButtonClicked ("+ paperX + ","+ paperY +")");
     //    			this.sticky_object_array[0].attr({
					// 	transform: 'translate(100,10)'
					// });
					// Snap.getElementByPoint(paperX, paperY).attr({fill: "Yellow"});
					console.log("done");
				}
 
			} 
			else{
				console.log("Clicked outside zone");
			}


		}
		// else if (eventType === "pointerMove" && this.dragging) {
		else if (eventType === "pointerMove") {
			// console.log("moving pointer");
			if(this.userInteraction[user.id].dragging){
				console.log("Dragging");
				var sid = this.userInteraction[user.id].stickyId;
				var sOldX = this.array_sticky[sid][0]; //Get X coordinate of the sticky's location
				var sOldY = this.array_sticky[sid][1]; //Get Y coordinate of the sticky's location
				var transX = paperX - sOldX;
				var transY = paperY - sOldY;

				// console.log("Old X:"+sidOldX+" Old Y:"+sidOldY+" New X: " + paperX + " New Y: "+ paperY );
				// console.log("Translate X:" + transX + " Translate Y:"+ transY);
				this.sticky_object_array[sid].attr({
						transform: 'translate('+transX+','+transY+')'
					});
			}
		}
		else if (eventType === "pointerRelease" && (data.button === "left")) {
			if(this.userInteraction[user.id].dragging){
				//Update the new coordinates of the sticky
				// var sid = this.userInteraction[user.id].stickyId;
				// this.array_sticky[sid][0] = paperX;
				// this.array_
				this.userInteraction[user.id].dragging = false;
				this.userInteraction[user.id].stickyId = null;
				console.log("Mouse Released: ->"+ JSON.stringify(this.userInteraction[user.id]));
			}
		}

		// Scroll events for zoom
		else if (eventType === "pointerScroll") {
		}
		else if (eventType === "widgetEvent"){
		}
		else if (eventType === "keyboard") {
			if (data.character === "m") {
				this.refresh(date);
			}
		}
		else if (eventType === "specialKey") {
			if (data.code === 37 && data.state === "down") { // left
				this.refresh(date);
			}
			else if (data.code === 38 && data.state === "down") { // up
				this.refresh(date);
			}
			else if (data.code === 39 && data.state === "down") { // right
				this.refresh(date);
			}
			else if (data.code === 40 && data.state === "down") { // down
				this.refresh(date);
			}
		}
	}
});
