@isTest
private class CaseMilestonesTrackerCtrl_Test
{
	@isTest
	static void testCaseMilestonesTrackerLogic()
	{
		//	get the first random sla process (doesn't matter which one)
		SlaProcess slaP = [SELECT Id FROM SlaProcess WHERE IsActive=true LIMIT 1];
		
		//	create an account
		Account acc = new Account(Name='Test');
		insert acc;

		//	create an entitlement for this account
		Entitlement ent = new Entitlement(Name='Default', AccountId=acc.Id, StartDate=Date.today(), SlaProcessId=slaP.Id);
		insert ent;

		//	create a case for this account + entitlement
		Case c = new Case(AccountId=acc.Id, EntitlementId=ent.Id);
		insert c;

		System.assertNotEquals(c.EntitlementId, null);

		test.startTest();

		List<CaseMilestone> mileStones = CaseMilestonesTrackerCtrl.getSpecificMilestonesForCase(c.Id, '');

		List<CaseMilestone> mileStonesFiltered = CaseMilestonesTrackerCtrl.getSpecificMilestonesForCase(c.Id, 'filtered');

		if(mileStones.size()>0){
			CaseMilestone mileStoneToClose = mileStones[0];

			CaseMilestonesTrackerCtrl.completeMilestone(mileStoneToClose.Id);
		}

		String bussHoursAsString = c.BusinessHoursId;
		if(bussHoursAsString!=null)
		{
			Boolean withinBusinessHours = CaseMilestonesTrackerCtrl.areWeWithinSpecifiedBusinessHours(bussHoursAsString);
		}
		
		ApexPages.StandardController sc = new ApexPages.StandardController(c);
        CaseMilestonesTrackerCtrl testCaseMilestonesTrackerCtrl = new CaseMilestonesTrackerCtrl(sc);
        
        PageReference pageRef = Page.CaseMilestonesTracker;
        pageRef.getParameters().put('id', String.valueOf(c.Id));
        Test.setCurrentPage(pageRef);

		test.stopTest();

	}
}