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

var movePopupToCenter = function() {
	$('#btc_popup').css('left', (window.innerWidth / 2) - $('#btc_popup').width() / 2);
	$('#btc_popup').css('top', (window.innerHeight / 2) - $('#btc_popup').height() / 2);
};

$(function() {
	var msnry = new Masonry('#box-container', {
		itemSelector: '.box',
		gutter: 20
	});

	genpassword(msnry);

	$('#in_timestamp').val(Math.ceil(new Date().getTime() / 1000));
	$('#out_date').html(calcdate());
	//$('#in_date').val($('#out_date').html().replace(' ', 'T'));
	$('#in_date').val($('#out_date').html());
	$('#out_timestamp').html($('#in_timestamp').val());
	msnry.layout();

	$.ajax({
		url: 'api/gethostname/' + $('#ip').html(),
		type: 'GET',
		success: function(ret) {
			$('#hostname').html('Hostname: ' + ret[0]);
			msnry.layout();
		}
	});

	$('input').keypress(function(key) {
		if (((key.keyCode === 13) || (key.which === 13)) && $(this).attr('data-click')) {
			$($(this).attr('data-click')).click();
			return false;
		}
		return true;
	});

	// *** Button handlers ***

	$('#genpasswordbtn').click(function() {
		genpassword(msnry);
		return false;
	});

	$('#datebtn').click(function() {
		$('#out_date').html(calcdate());
		msnry.layout();
		return false;
	});

	$('#strtodatebtn').click(function() {
		if ($('#in_date').val()) {
			$('#out_timestamp').html(Math.ceil(new Date($('#in_date').val()).getTime() / 1000));
			msnry.layout();
		}
		return false;
	});

	$('#gethostnamebtn').click(function() {
		if ($('#in_ip').val()) {
			$('#hostloader').show();
			$('#out_hostname').html('');
			$.ajax({
				url: 'api/gethostname/' + $('#in_ip').val(),
				type: 'GET',
				success: function(ret) {
					$('#out_hostname').html('Hostname: ' + ret[0]);
					$('#hostloader').hide();
					msnry.layout();
				}
			});
		}
		return false;
	});

	$('#getipbtn').click(function() {
		if ($('#in_hostname').val()) {
			$('#iploader').show();
			$('#out_ip').html('');
			$.ajax({
				url: 'api/getip/' + $('#in_hostname').val(),
				type: 'GET',
				success: function(ret) {
					$('#out_ip').html('IP: ' + ret[0]);
					$('#iploader').hide();
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
				url: 'api/genhash/' + $('#in_hash').val() + '/' + encodeURIComponent($('#in_hash_str').val()),
				type: 'GET',
				success: function(ret) {
					$('#out_hash').html('Eredmény: ' + ret);
					msnry.layout();
				}
			});
		}
		return false;
	});

	$('#ue').click(function() {
		$('#ue').attr('checked', 'checked');
		$('#ud').removeAttr('checked');
	});

	$('#ud').click(function() {
		$('#ud').attr('checked', 'checked');
		$('#ue').removeAttr('checked');
	});

	$('#uedbtn').click(function() {
		if ($('#in_uedstr').val()) {
			if ($('#ue').attr('checked')) {
				// encode
				$('#out_ued').html('Eredmény: ' + encodeURI($('#in_uedstr').val()));
			} else {
				// decode
				$('#out_ued').html('Eredmény: ' + decodeURI($('#in_uedstr').val()));
			}
			msnry.layout();
		}
		return false;
	});

	$('#b64e').click(function() {
		$('#b64e').attr('checked', 'checked');
		$('#b64d').removeAttr('checked');
	});

	$('#b64d').click(function() {
		$('#b64d').attr('checked', 'checked');
		$('#b64e').removeAttr('checked');
	});

	$('#b64edbtn').click(function() {
		if ($('#in_b64edstr').val()) {
			$('#out_b64ed').html('');
			$.ajax({
				url: 'api/base64/' + ($('#b64e').attr('checked') ? 'encode' : 'decode') + '/' + encodeURIComponent($('#in_b64edstr').val()),
				type: 'GET',
				success: function(ret) {
					$('#out_b64ed').html('Eredmény: ' + ret);
					msnry.layout();
				}
			});
		}
		return false;
	});

	$('.news_title').click(function() {
		var news_desc = $(this).next();
		if ($(news_desc).css('display') === 'block') {
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
		return false;
	});
	
	$('.btc_btn').click(function() {
		if ($('#shadow').css('display') === 'none') {
			$('#shadow').show();
			$('#btc_popup').show();
			movePopupToCenter();
		}
		return false;
	});
	
	$('#shadow').click(function() {
		$('#btc_popup').hide();
		$('#shadow').hide();
	});

});
