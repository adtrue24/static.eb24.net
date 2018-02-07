function check_leave()
{

	var dd = (document.referrer.split('/')[2]);
	if(document.referrer != '')
	{
		var index = dd.indexOf(SITE_HOST);
		if(index === -1)
		{

		 	window.onbeforeunload = function()
		    {
		      return 'Are you sure you want to leave?';
		    };

		}


	}


}
check_leave();