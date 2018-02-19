function check_leave()
{
	var dd = (document.referrer.split('/')[2]);
	if(document.referrer == '')
	{

	}
	else
	{
		var index = dd.indexOf(SITE_HOST);
		if(index !== -1)
		{

		}
		else
		{
		    window.onbeforeunload = function()
		    {
		      return 'Are you sure you want to leave?';
		    };
		}
	}
}