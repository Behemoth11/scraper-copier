var spinner='<div class="text-center" id="spinner" style="width:100%"><div class="lds-css ng-scope"><div style="width:100%;height:100%;margin:auto" class="lds-bars"><div></div><div></div><div></div><div></div></div></div></div>';var dark=false;$(document).ready(function(){$('[data-bs-toggle="tooltip"]').tooltip({trigger:'hover'});$('[data-bs-toggle="popover"]').popover({html:true});$(".navbaritem").mouseup(function(){$(this).blur();});$("#nightSwitch").click(function(){$("*").toggleClass("nightmode");$("*").toggleClass("animated");$("#main").toggleClass("col-lg-9 col-lg-12");});$(".letterlink").click(function(){var l=$(this).text();var p=window.location.pathname.split("/")[1];$.get('/request',{letter:l,page:p},function(data){$("#anime-list").html(data).hide().fadeIn(500);});$('li.page-item.active').removeClass('active');$(this).parent().addClass('active');});$("#fav-heart").click(function(){var id=$('#animeid').val();$.get('/request',{togglefavourite:true,animeid:id},function(data,status){if(data=='1'){$('#fav-heart').html('<i class="heart fa fa-heart"></i>');}else{$('#fav-heart').html('<i class="heart fa fa-heart-o"></i>');}});});$(".preference-btn").click(function(){var preference=$(this).val();$.post('/request',{setpreference:true,preference:preference},function(data,status){console.log("changed it!");});});$('#clear-all-history').click(function(){$.post('/request',{clearhistory:true},function(data,status){alert("Cleared History!");});});$(".del-anime").click(function(){var id=$(this).children('input').val();var element=$(this);$.get('/request',{togglefavourite:true,animeid:id},function(data,status){element.parent().parent().parent().remove();});});$("img").on("error",function(){$(this).attr("src","public/img/404_image.png");});var optionsGenre={success:function(data){$('#collapse1').collapse("hide");$("#anime-list").html(data).hide().fadeIn(1000);$('#genreForm').clearForm();},error:function(e){$("#anime-list").html('<h3 style="padding-top: 20px;">Error </h3>').hide().fadeIn(1000);}};$('#genreForm').ajaxForm(optionsGenre);$("#submitGenre").click(function(){$("#anime-list").html(spinner);$('#collapse1').collapse("hide");});$('#search-bar').autocomplete({serviceUrl:'/request',paramName:'livequery',preventBadQueries:false,onSelect:function(suggestion){window.location.replace(suggestion.data);}});if($('body.dark').length){dark=true;$(".darkmode").toggleClass("fa-moon-o").toggleClass("fa-sun-o");}
$('#dark-toggle').click(function(){var exdate=new Date();exdate.setDate(exdate.getDate()+356);var expiry=exdate.toUTCString();if(!dark){$('body').addClass('dark');document.cookie="theme=dark;expires="+expiry+";domain=.animesimple.com;path=/";dark=true;}else{$('body').removeClass('dark');document.cookie="theme=light;expires="+expiry+";domain=.animesimple.com;path=/";dark=false;}
$(".darkmode").toggleClass("fa-moon-o").toggleClass("fa-sun-o");});});