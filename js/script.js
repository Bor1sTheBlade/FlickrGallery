(function(){


    var _photos;
    var _ul;
    var _allowDownload;
    var _scrollDuration = 750;
    var _allowScrolling = true;

     window.onload = function(){
       loadPhotos();
       addOnWheelListener();
      };


     function loadPhotos(){

      _ul =  document.getElementById("og-grid");
      _allowDownload = true;

      var xhr = new XMLHttpRequest();

       xhr.open('POST','https://api.flickr.com/services/rest/?method=flickr.photos.getRecent&api_key=9e3ec094cddaf11bf7052b997c5cd7b1&per_page=50&format=json&nojsoncallback=1&api_sig=3f7b330e35d8b4310104a4efb1446b57', true);
       xhr.send();

        xhr.onreadystatechange = function() { 
          if (this.readyState == 4 && this.status == 200 && _allowDownload){
            if (this.responseText){
                var response = JSON.parse(xhr.responseText);
                _photos = response.photos.photo;
                makeList();
                _allowDownload = false;
            }
           }
         }
       };

     function makeList(){
       for(var i = 0; i<_photos.length; i++){
            var a  = document.createElement("a");
            var li = document.createElement("li");
            var img = document.createElement("img");
            img.setAttribute("src","https://farm"+_photos[i].farm +".staticflickr.com/"+_photos[i].server+"/"+ _photos[i].id +"_"+ _photos[i].secret+".jpg");
            a.appendChild(img);
            li.appendChild(a);
            _ul.appendChild(li);
        }
       selectElement(_ul.children[0]);
     };

      function selectElement(li){
         li.classList.add("selected");
      };

      function unselectElement(){
        document.getElementsByClassName("selected")[0].className =
          document.getElementsByClassName("selected")[0].className.replace(/\bselected\b/,'');
      };
      
      document.onkeydown = function(e) {
       var shift;
       var keyCode = e.keyCode || e.which,
        arrow = {left: 37, up: 38, right: 39, down: 40 };
                            //I undersand that is bad for adaptive design but..
          switch (keyCode) { // > 'В ряду должно быть по 5 фото'
            case arrow.left: // that's why :)
              shift = -1;
            break;
            case arrow.up:
              shift = -5;
            break;
            case arrow.right:
              shift = 1;
            break;
            case arrow.down:
              shift = 5;
            break;
          }
          
       moveFocus(shift);
      };


       function moveFocus(shift){
          for( var i = 0; i < _ul.children.length; i ++) {
              if( _ul.children[i].classList.value == 'selected'){
                 if( ( i + shift >= 0 ) && (shift + i <= _ul.children.length-1 ) ){
                  unselectElement();
                  if(Math.abs(shift) == 5 || (Math.abs(shift) != 5 && shift > 0 && (i + shift) % 5 == 0) // for right scrolling
                                          || (Math.abs(shift) != 5 && shift < 0 && (i + shift + 1 ) % 5 == 0)){ 
                   doScrolling(_ul.children[i+shift], _scrollDuration, shift);
                 }
                 _ul.children[i+shift].classList.add("selected");
                 return;
              }
           }
         }
      };
      
      function MouseWheelHandler(e) {
        if(!_allowScrolling) return;

          _allowScrolling = false;
          var e = window.event || e; 
          var delta = Math.max(-5, Math.min(5, (e.wheelDelta || -e.detail)));
          setTimeout(function() { 
               moveFocus(-delta);
              _allowScrolling = true;
              }, _scrollDuration);
          console.log(delta);
          return false;
      };

       function addOnWheelListener(){
          if (_ul.addEventListener){
            // IE9, Chrome, Safari, Opera
            _ul.addEventListener("mousewheel", MouseWheelHandler, false);
            // Firefox
            _ul.addEventListener("DOMMouseScroll", MouseWheelHandler, false);
         }
        // IE 6/7/8
        else{
            _ul.attachEvent("onmousewheel", MouseWheelHandler);
         }
        };
   
        function doScrolling(element, duration, shift) {
          var startingY = window.pageYOffset;
          var elementY = shift > 0 ? window.pageYOffset + element.getBoundingClientRect().height : window.pageYOffset - element.getBoundingClientRect().height; 
          var targetY = document.body.scrollHeight - elementY < window.innerHeight ? document.body.scrollHeight - window.innerHeight : elementY
          var diff = targetY - startingY;
          var easing = function (t) { return t<.5 ? 4*t*t*t : (t-1)*(2*t-2)*(2*t-2)+1 };
          var start;

          if (!diff) return;

          window.requestAnimationFrame(function step(timestamp) {
            if (!start) start = timestamp;
            var time = timestamp - start;
            var percent = Math.min(time / duration, 1);
            percent = easing(percent);

            window.scrollTo(0, startingY + diff * percent);
            if (time < duration) {
              window.requestAnimationFrame(step);
            }
          });
       };
})();

