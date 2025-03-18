document.write('<h1 style="font-family: Courier New; font-size: 30px; color:red;margin-top:200px;">' + chrome.i18n.getMessage("strDeviceRequirement") + '</h1>');

var constraints = {
    audio: true,
    video: true
};

navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
}).catch(function(e) {
    //console.log(e.message);
});
