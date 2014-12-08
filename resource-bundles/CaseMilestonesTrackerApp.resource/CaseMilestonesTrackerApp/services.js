angular.module('CaseMilestonesTrackerApp.services', [])

.service('CaseMilestonesService', function($q){

	this.getCaseMilestones = function(caseId, milestoneTypes, callback, error){
		var deferred = $q.defer();
		
		Visualforce.remoting.Manager.invokeAction('CaseMilestonesTrackerCtrl.getSpecificMilestonesForCase', caseId, milestoneTypes, function(result){
			var r = result;
			console.log(r);
			deferred.resolve(r);
		},{
				escape: false
		});
		return deferred.promise;
	}

	this.completeMilestone = function(milestoneId, callback, error){
		var deferred = $q.defer();
		
		Visualforce.remoting.Manager.invokeAction('CaseMilestonesTrackerCtrl.completeMilestone', milestoneId, function(result){
			var r = result;
			console.log(r);
			deferred.resolve(r);
		},{
				escape: false
		});
		return deferred.promise;
	}

	this.wihtinBusinessHours = function(businessHoursId, callback, error){
		var deferred = $q.defer();
		
		if(businessHoursId!=undefined && businessHoursId!=null){
			Visualforce.remoting.Manager.invokeAction('CaseMilestonesTrackerCtrl.areWeWithinSpecifiedBusinessHours', businessHoursId, function(result){
				var r = result;
				console.log(r);
				deferred.resolve(r);
			},{
					escape: false
			});
		}
		else{
			deferred.resolve(true);
		}
		
		return deferred.promise;
	}
})