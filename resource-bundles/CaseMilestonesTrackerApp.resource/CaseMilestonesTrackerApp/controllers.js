angular.module('CaseMilestonesTrackerApp.controllers', [])

.controller('CaseMilestonesTrackerController', function($scope, $filter, $timeout, CaseMilestonesService){
	if(typeof caseId != 'undefined' && caseId != '')
		$scope.caseId = caseId;
	if(typeof clockStopped != 'undefined' && clockStopped != '')
		$scope.clockStopped = clockStopped;
	if(typeof businessHoursId != 'undefined' && businessHoursId !='')
		$scope.businessHoursId = businessHoursId;

	$scope.milestoneTypesToTake = '';

	CaseMilestonesService.getCaseMilestones($scope.caseId, $scope.milestoneTypesToTake).then(function(d){
				$scope.milestones = $filter('orderBy')(d, 'TargetDate', false);
				console.log($scope.milestones);	

				CaseMilestonesService.wihtinBusinessHours($scope.businessHoursId).then(function(dBHours){
					var withinBusinessHours = dBHours;
					$scope.withinBusinessHours = withinBusinessHours;
				},function(d){console.log(dBHours)});

				$scope.enrichMilestones();
				$scope.arrangeTimer();	
	},function(d){console.log(d)});

	$scope.enrichMilestones = function(){
		for (var i = $scope.milestones.length - 1; i >= 0; i--) {
			var mileStone = $scope.milestones[i];

			if(mileStone.TimeRemainingInMins!='00:00'){
				var minutesPart = mileStone.TimeRemainingInMins.substring(0,mileStone.TimeRemainingInMins.indexOf(':'));
				var minutesPartAsInt = parseInt(minutesPart);
				mileStone.timeToShow = minutesPartAsInt;
			}else if(mileStone.TimeSinceTargetInMins!='00:00'){
				var minutesPart = mileStone.TimeSinceTargetInMins.substring(0,mileStone.TimeSinceTargetInMins.indexOf(':'));
				var minutesPartAsInt = parseInt(minutesPart);
				mileStone.timeToShow = minutesPartAsInt;
			}else if(mileStone.ElapsedTimeInMins!=undefined){
				mileStone.timeToShow = mileStone.ElapsedTimeInMins;
			}
			else{
				mileStone.timeToShow = 0;
			}

			if(mileStone.timeToShow>=0){
				mileStone.percent = function(){
					var percentToReturn = Math.round((1 - (this.timeToShow / this.TargetResponseInMins)) * 100);
					if(this.IsCompleted){
						return 100 - percentToReturn;
					}
					else if(this.IsViolated){
						//	cap it at 100%
						return 100;
					}
					else{
						return percentToReturn;
					}
				};
			}

			mileStone.getClassByPercentage = function(){
				var bgClass = 'progress-bar-success';

				if((this.percent()>=60 && this.percent()<80) && this.IsCompleted==false){
					bgClass = 'progress-bar-warning';
				}
				else if((this.percent()>=80 && this.IsCompleted==false) || this.IsViolated){
					bgClass = 'progress-bar-danger';
				}

				return bgClass;
			}

			mileStone.getIconByMilestoneStatus = function(){
				var iconName = '';

				if(this.IsCompleted && !this.IsViolated){
					//iconName=='glyphicon-ok';
					iconName = 'glyphicon-thumbs-up'
				}
				else if(this.IsViolated){
					//iconName=='glyphicon-remove';
					iconName = 'glyphicon-thumbs-down';
				}
				else{
					if($scope.clockStopped || !$scope.withinBusinessHours){
						iconName = 'glyphicon-pause';
					}
					else{
						if(this.percent()>=60 && this.percent()<80){
							iconName = 'glyphicon-eye-open';
						}
						else if(this.percent()>=80){
							iconName = 'glyphicon-fire';
						}
						else{
							iconName = 'glyphicon-time';
						}
					}
				}

				return iconName;
			}
		};
	}

	$scope.completeMilestone = function(mileStone){
		CaseMilestonesService.completeMilestone(mileStone.Id).then(function(d){
			if(d=='OK'){
				//	reload the milestones info
				CaseMilestonesService.getCaseMilestones($scope.caseId, $scope.milestoneTypesToTake).then(function(d){
					$scope.milestones = $filter('orderBy')(d, 'TargetDate', false);
					console.log($scope.milestones);	
					$scope.enrichMilestones();	
				},function(d){console.log(d)});
			}	
			else{
				alert(d);
			}
		},function(d){console.log(d)});
	}

	$scope.arrangeTimer = function(){
		$scope.tickInterval = 60000; // equals one minute expressed in ms

		$scope.tick = function(){
			CaseMilestonesService.wihtinBusinessHours($scope.businessHoursId).then(function(d){
				var withinBusinessHours = d;
				$scope.withinBusinessHours = withinBusinessHours;

				if(withinBusinessHours){
					for (var i = $scope.milestones.length - 1; i >= 0; i--) {
						var mileStone = $scope.milestones[i];

						if(!mileStone.IsCompleted){
							if(mileStone.IsViolated){
								mileStone.timeToShow++;
							}
							else{
								mileStone.timeToShow--;
								if(mileStone.timeToShow==0){
									mileStone.IsViolated = true;
								}
							}
						}
					}
				}

				$timeout($scope.tick, $scope.tickInterval);	
				
			},function(d){console.log(d)});
		}

		if(!$scope.clockStopped){
			$timeout($scope.tick, $scope.tickInterval);
		}
	}
})