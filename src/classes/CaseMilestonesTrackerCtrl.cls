global without sharing class CaseMilestonesTrackerCtrl {
	private final sObject mysObject;

	public CaseMilestonesTrackerCtrl(ApexPages.StandardController stdController) {
		this.mysObject = (sObject)stdController.getRecord();
	}

	@RemoteAction
	global static List<CaseMilestone> getSpecificMilestonesForCase(String caseId, String mileStoneTypesCommaSeperated){
		List<CaseMilestone> mstones = new List<CaseMilestone>();
		List<CaseMilestone> mstonesToReturn = new List<CaseMilestone>();

		Map<Id, MilestoneType> mstoneTypesMap;

		if(mileStoneTypesCommaSeperated!=''){
			String[] types = mileStoneTypesCommaSeperated.split(',');
			List<MilestoneType> mstoneTypes = [SELECT Id FROM MilestoneType WHERE Name in : types];
			mstoneTypesMap = new Map<Id, MilestoneType>(mstoneTypes);
		}

		if(mstoneTypesMap!=null){
			mstones = [
				SELECT MilestoneTypeId, MilestoneType.Name, MilestoneType.RecurrenceType, CompletionDate, IsCompleted, IsViolated, StartDate, TargetDate, 
				TargetResponseInMins, TimeRemainingInMins, ElapsedTimeInMins, TimeSinceTargetInMins
				FROM CaseMilestone
				WHERE CaseId=:caseId
				AND MilestoneTypeId in : mstoneTypesMap.keySet()
				ORDER BY TargetDate
			];
		}else{
			mstones = [
				SELECT MilestoneTypeId, MilestoneType.Name, MilestoneType.RecurrenceType, CompletionDate, IsCompleted, IsViolated, StartDate, TargetDate, 
				TargetResponseInMins, TimeRemainingInMins, ElapsedTimeInMins, TimeSinceTargetInMins
				FROM CaseMilestone
				WHERE CaseId=:caseId
				ORDER BY TargetDate
			];
		}

		//	a little bit of code to only return the last "recurring feedback target" milestone (since it could return many)
		Map<Id, CaseMilestone> mapMilestoneTypeIdToLastMilestone = new Map<Id, CaseMilestone>();

		for(CaseMilestone ms : mstones){
			if(ms.MilestoneType.RecurrenceType=='No Recurrence'){
				mstonesToReturn.add(ms);
			}
			else{
				mapMilestoneTypeIdToLastMilestone.put(ms.MilestoneTypeId, ms);
			}
		}

		for(String msTypeId : mapMilestoneTypeIdToLastMilestone.keySet()){
			mstonesToReturn.add(mapMilestoneTypeIdToLastMilestone.get(msTypeId));
		}

		return mstonesToReturn;
	}

	@RemoteAction
	global static String completeMilestone(Id milestoneId){
		String completionResult = 'OK';

		List<CaseMilestone> mstones = [SELECT Id, CompletionDate FROM CaseMilestone WHERE Id=:milestoneId];

		if(mstones!=null){
			CaseMilestone mstone = mstones[0];

			if(mstone.CompletionDate==null){
				mstone.CompletionDate = Datetime.now();

				try{
					update mstone;
				}
				catch(Exception e){
					completionResult = e.getMessage();
				}
			}
		}

		return completionResult;
	}

	@RemoteAction
	global static Boolean areWeWithinSpecifiedBusinessHours(String businessHoursId){
		return BusinessHours.isWithin(businessHoursId, Datetime.now());
	}
}