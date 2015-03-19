$(function() {
	$.ajax({
	   url: 'api/genpassword?_mt=' + Math.random(),
	   type: 'GET',
	   success: function(ret) {
		   $('#password').html(ret);
	   }
   });

	//console.log($('#ip').html());
	$.ajax({
		url: 'api/gethostname/' + $('#ip').html(),
		type: 'GET',
		success: function(ret) {
			//console.log(ret);
			$('#hostname').html(ret[0]);
		}
	});
});
