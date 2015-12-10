		var current_index = 0; //当前单词索引
		var user_win_num = 0,  //用户和机器人得分
			robot_win_num = 0;
		var total_words_num = word_json.words.length; //单词长度
		var data = {
			"details":[]
		};
		$(function(){
			//getJSON();
			$(window).resize(checkWindowSize);
			$("#nextButton").click(nextClick);
			initPage(current_index);
		});
		function initPage(n){
			dataInit(n);
			checkWindowSize();
			timeInit();
			inputInit(n);
		}
		//Time controller
		function timeInit() {
		    msec = 0;
			sec = 0;
			min = 0;
			totalmsec = 0;
			//$("#startTime").click(startTime);
			//$("#stopTime").click(stopTime);
			startTime();
		}
		function startTime() {
			//time start
			timeStart = null;
			timeStart = setInterval(addTime,100);
			checkRobot();
		}
		function addTime() {
			totalmsec += 100;
			msec += 100;
			if (msec > 900) {
				msec -= 1000;
				sec++; 
				checkRobot();
			}
			if (sec >= 60) {
				sec -= 60;
				min++;
			}
			//$("#time").text(fixTime(min)+':'+fixTime(sec)+':'+fixMsec(msec));
		}
/*		function fixTime(i){
			if (i < 10) {
				i = '0' + i;
			}
			return i;
		}
		function fixMsec(i){
			if (i < 10) {
				i = '00' + i;
			}
			return i;
		}*/
		function stopTime() {
			//console.log("stop!");
			clearInterval(timeStart);
			//clearInterval(vm_time_bg);
			//console.log(totalmsec);
		}
		//data initialization
		function dataInit(n){
			//init inputs
			current_word = word_json.words[n];
			current_right_answer = current_word.name;
			current_right_num = 0;
			current_right_need = 0;
			current_word_length = current_word.name.length;
			current_user_right_num = 0;
			current_robot_right_num = 0;
			current_user_accuracy = 0;
			detail = {
				"word" : current_right_answer
			};
			current_user_time = null;
			//detial time array initializtion
			detail.time = new Array(current_word_length);
			for (var j = 0; j < current_word_length; j++){
				detail.time[j] = null;
			}
			
			$("#input-area").html("");
			$("#tip-area").html("");
			for (var i = 0; i < current_word.name.length; i++){
				//console.log(current_word.name[i]);
				if(current_word.show[i] === 1){
					html = "<input type='text' class='defalut' readonly value="+current_word.name[i]+">";
					$("#input-area").append(html);
				} else {
					current_right_need++;
					html = "<input type='text' maxlength='1'>";
					$("#input-area").append(html);
				}
			}
			//init tips
			//console.log(current_word.correlation);
			for (i = 0; i < current_word.correlation.length ; i++){
				html = "<div class='tip'>"+current_word.correlation[i]+"</div>";
				$("#tip-area").append(html);
			}
		}
		//input controller
		function inputInit(){
			$inputRequire = $("#input-area input:not(.defalut)");
			$inputRequire[0].focus();
			$("#input-area input").bind("keyup",jumpNext);
		}
		function jumpNext(){
			if ($(this).val().length === 1){
				var nn = $(this).nextAll("input:not(.correct , .defalut , .lock)");
				//fix bug: nn is not a jquery object but a DOM object
				if($(nn) !== 0){
					$(nn[0]).focus().click();
					$(nn[0]).val("");
				}
				checkInput($(this));
			}
		}
		function checkInput($n){
			if ($n.val().toLowerCase() === current_right_answer.substr($n.index(),1) ){
				$n.addClass("correct");
				$n.attr("readonly","readonly");
				current_user_right_num ++;
				current_right_num ++ ;
				detail.time[$n.index()] = sec;
			} else{
				$n.addClass("incorrect").click(changeInput);
			}
			nextQuestion();
		}
		function nextQuestion(){
			// next question
			if (current_right_num === current_right_need){
				setTimeout(nextQuestionInit,1000);
			}
		}
		//click "next question"
		function nextClick(){
			if(current_index < total_words_num ) {
				current_robot_right_num += 100;
			}
			nextQuestionInit();
		}
		function nextQuestionInit(){
			//add accuracy data
			current_word.accuracy = current_user_right_num/current_right_need;
			addScore();
			current_index ++ ;
			data.details.push(detail);
			sendDataByGet();
			if (current_index === total_words_num - 1) {
				$("#nextButton").remove();
			}
			if (current_index !== total_words_num) {
				stopTime();
				initPage(current_index);
			} else {
				stopTime();
				judgeWinner();
			}
		}
		function changeInput(){
			if ($(this).hasClass("incorrect")){
				$(this).removeClass("incorrect").val("");
			}
		}
		function checkRobot(){
			for (var i = 0; i < current_word_length; i++ ) {
				if ( sec === current_word.AI[i]) {
					var $n = $("#input-area input:eq("+i+")");
					if (!$n.hasClass("defalut") && !$n.hasClass("correct")){
						$n.addClass("lock");
						$n.attr("readonly","readonly");
						$n.val(current_right_answer.substr(i,1));
						if ($n.is(":focus")) {
							$n.next().focus().click();
						}
						current_robot_right_num ++;
						current_right_num ++ ;
						nextQuestion();
					}

				}
			}
		}
		function addScore(){
			if (current_robot_right_num < current_user_right_num){
				//console.log("user+1");
				user_win_num++;
			} else if (current_robot_right_num == current_user_right_num){
				//console.log("play even");
			} else {
				//console.log("robot win");
				robot_win_num++;
			}
		}
		function judgeWinner(){
			sortAccuracy();
			//sendData();
			//$("#nextButton").unbind("click",nextClick);
			if (user_win_num > robot_win_num) {
				alert("恭喜你赢了");
			} else if (user_win_num === robot_win_num){
				alert("平局！");
			} else {
				alert("很遗憾你输了");
			}
			//for ()
		}
		function getJSON(){
			console.log("getJSON");
/*			$.get( "/demo/get_words" ,{}, 
				function(data,textStatus){
					var a = 1;
				}
			});*/
			$.ajax({
				type: "GET",
				contentType:"application/json;charset=utf-8",
				url: "/demo/get_words",
				//data: JSONdata,
				dataType: "json",
				success: function (data, textStatus){
					word_json = data;
					console.log("getJSON succussfully :" +textStatus);
				},
				error: function (){
					console.log("haven't getJSON");
				}
			});
		}
		function sendData(){
			var JSONdata = JSON.stringify(data);
			console.log(JSONdata);
/*			$.ajax({
				type: "POST",
				contentType:"application/json;charset=utf-8",
				url: "/demo/update_user_word_time",
				data: JSONdata,
				dataType: "json",
				success: function (){
					console.log("sending succussfully");
				},
				error: function (){
					console.log("haven't sent");
				}
			});*/
		}
		function sendDataByGet(){
			for (var i = 0; i < current_word_length; i++) {
				current_user_time = current_user_time + "/" + detail.time[i];
			}
			console.log(current_user_time);
			$.ajax({
				type: "GET",
				contentType:"application/json;charset=utf-8",
				url: "/demo/update_user_word_time",
				data: {word: current_right_answer, time: current_user_time},
				dataType: "json",
				success: function (){
								console.log("sending time succussfully");
							},
				error: function (){
								console.log("haven't sent");
							}
			});
		}
		function checkWindowSize(){
			var height = $(window).height();
			if ( height < 300 ) {
				$(".tip").addClass("small");
			} else if ($(".tip").hasClass("small")) {
				$(".tip").removeClass("small");
			}
		}
		function sortAccuracy(){
			//console.log(word_json.words);	
			insertSort(word_json.words);
		}
		//Straight Insertion Sort 直接插入排序
		function insertSort(A){
			//var A = array;
			var key = null;
			var i = null;
			for (var j = 1; j< total_words_num; j++) {
				key = A[j];
				i = j - 1;
				while( i > -1 && A[i].accuracy > key.accuracy){
					A[i+1] = A[i];
					i--;
				}
				A[i+1] = key;
			}
			showAccuracy();
		}
		function showAccuracy(){
			/*for (var i = 0; i < total_words_num; i++) {
				console.log(word_json.words[i].name+":Accuracy = "+ word_json.words[i].accuracy);
			}*/
			$("#input-area").html("");
			$("#tip-area").html("");
			for (var j = 0; j < total_words_num; j++){
				html = "<div class='tip'>"+word_json.words[j].name+"</div>";
				$("#tip-area").append(html);
			}
		}
/*		//VUE - MVVM
		//vue time
		var i = 0,
		s = 0,
		m = 0;
		var vm_time = new Vue({
			el: '#vmtime',
			data: {
				time: i				
				}
		});
		var vm_time_bg = setInterval(function(){
			i += 100;
			if (i > 900) {
				i -= 1000;
				s++;
			}
			if (s > 59) {
				s -= 60;
				m++;
			}
			vm_time.time = fixTime(m) + ":" + fixTime(s) + ":" + fixMsec(i);
		},100);
		//vue content
		var vm_main = new Vue({
			el: '.main',
			data: {
				inputs: [
					{ input: "<input type='text' readonly value='v''>"},
					{ input: "<input type='text' maxlength='1'>"}
				],
				tips: [
					{ tip: '<div class="tip">这是基于VUE数组的提示</div>'},
					{ tip: '<div class="tip">这是基于VUE数组的提示</div>'}
				]
			}
		});
		//console.log(vm_main.tips[0].tip);
		vm_main.inputs.push({input:'<input type="text" readonly value="e">'});
		vm_main.tips.push({tip: '<div class="tip">这是基于VUE数组动态增加的提示</div>'});*/