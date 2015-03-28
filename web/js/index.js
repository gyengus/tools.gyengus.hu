var genpassword = function(msnry) {
	$.ajax({
	   url: 'api/genpassword?_mt=' + Math.random(),
	   type: 'GET',
	   success: function(ret) {
		   $('#password').html(ret);
		   msnry.layout();
	   }
	});
};

var calcdate = function() {
	if ($('#in_timestamp').val()) {
		var time = new Date($('#in_timestamp').val() * 1000);
		var month = ((time.getMonth() + 1) > 9 ? '' : '0') + (time.getMonth() + 1);
		var day = (time.getDate() > 9 ? '' : '0') + time.getDate();
		var hour = (time.getHours() > 9 ? '' : '0') + time.getHours();
		var minute = (time.getMinutes() > 9 ? '' : '0') + time.getMinutes();
		var second = (time.getSeconds() > 9 ? '' : '0') + time.getSeconds();
		return time.getFullYear() + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second;
	}
};

$(function() {
	var msnry = new Masonry('#box-container', {
		itemSelector: '.box',
		gutter: 20
	});

	genpassword(msnry);

	$('#in_timestamp').val(Math.ceil(new Date().getTime() / 1000));
	$('#out_date').html(calcdate());
	$('#in_date').val($('#out_date').html());
	$('#out_timestamp').html($('#in_timestamp').val());
	msnry.layout();

	$.ajax({
		url: 'api/gethostname/' + $('#ip').html(),
		type: 'GET',
		success: function(ret) {
			//console.log(ret);
			$('#hostname').html(ret[0]);
			msnry.layout();
		}
	});

	// *** Gombkezelés ***

	$('#genpasswordbtn').click(function() {
		genpassword(msnry);
		return false;
	});

	$('#datebtn').click(function() {
		$('#out_date').html(calcdate());
		msnry.layout();
		return false;
	});

	$('#gethostnamebtn').click(function() {
		if ($('#in_ip').val()) {
			$('#out_hostname').html('');
			$.ajax({
				url: 'api/gethostname/' + $('#in_ip').val(),
				type: 'GET',
				success: function(ret) {
					//console.log(ret);
					$('#out_hostname').html('Hostname: ' + ret[0]);
					msnry.layout();
				}
			});
		}
		return false;
	});

	$('#getipbtn').click(function() {
		if ($('#in_hostname').val()) {
			$('#out_ip').html('');
			$.ajax({
				url: 'api/getip/' + $('#in_hostname').val(),
				type: 'GET',
				success: function(ret) {
					//console.log(ret);
					$('#out_ip').html('IP: ' + ret[0]);
					msnry.layout();
				}
			});
		}
		return false;
	});

	$('#genhashbtn').click(function() {
		if ($('#in_hash_str').val()) {
			$('#out_hash').html('');
			$.ajax({
				url: 'api/genhash/' + $('#in_hash').val() + '/' + $('#in_hash_str').val(),
				type: 'GET',
				success: function(ret) {
					//console.log(ret);
					$('#out_hash').html('Eredmény: ' + ret);
					msnry.layout();
				}
			});
		}
		return false;
	});

	$('.expandbtn').click(function() {
		var news_desc = $(this).next();
		if ($(news_desc).css('display') == 'block') {
			$(this).find('span').removeClass('icon-circle-up').addClass('icon-circle-down');
			$(news_desc).slideUp(function() {
				msnry.layout();
			});
		} else {
			$(this).find('span').removeClass('icon-circle-down').addClass('icon-circle-up');
			$(news_desc).slideDown(function() {
				msnry.layout();
			});
		}
	});
});
