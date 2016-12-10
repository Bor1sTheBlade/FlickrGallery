(function(){

    var _photos;
    var _ul;
    var _allowDownload;
    var _scrollDuration = 325;
    var _allowScrolling = true;
    var _photosPerPage = "50";
    var _nextPage;
    var _selectPhotoIter = 0;
    var _countOfPhotosInRow = 5;

     window.onload = function(){
       loadPhotos();
       addOnWheelListener();
      
      };

     function loadPhotos(){
      //error while trying to load less then 50 photos per page
      // if link doesn't work https://www.flickr.com/services/api/explore/flickr.photos.getRecent - can generate new one here
      var queryString = "https://api.flickr.com/services/rest/?method=flickr.photos.getRecent&api_key=d2630580e5a4cb7a7cf5e14a4315a099&per_page="+_photosPerPage+"&format=json&nojsoncallback=1&api_sig=125c9754ab76c4b3069b4f5d1d117b39"
     
      if(!_ul)
       _ul =  document.getElementById("og-grid");
     
      _allowDownload = true;
      var xhr = new XMLHttpRequest();
    
       xhr.open('POST',queryString, true);
       xhr.send();

        xhr.onreadystatechange = function() { 
          if (this.readyState == 4 && this.status == 200 && _allowDownload){
            if (this.responseText){
                var response = JSON.parse(xhr.responseText);
                _photos = response.photos.photo;
                _allowDownload = false;
                makeList();
                _nextPage = 20; //this amount can be changed to any one else
            }
           }
         }
       };

     function makeList(loadMoreIter){
      var to = _nextPage ? _nextPage : _photos.length;
       for(var i = 0; i<to; i++){
            var a  = document.createElement("a");
            var li = document.createElement("li");
            var img = document.createElement("img");
            img.setAttribute("src","https://farm"+_photos[i].farm +".staticflickr.com/"+_photos[i].server+"/"+ _photos[i].id +"_"+ _photos[i].secret+".jpg");
            a.appendChild(img);
            li.appendChild(a);
            _ul.appendChild(li);
        }

          if(to == _photos.length) // if it is innitial entry
           selectElement(_ul.children[_selectPhotoIter]);
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
                            //that is bad for adaptive design but..
          switch (keyCode) { // > 'В ряду должно быть по 5 фото'
            case arrow.left: // that's why :)
              shift = -1;
            break;
            case arrow.up:
              shift = -_countOfPhotosInRow;
            break;
            case arrow.right:
              shift = 1;
            break;
            case arrow.down:
              shift = _countOfPhotosInRow;
            break;
          }
          moveFocus(shift);
      };

       function moveFocus(shift){
         if(!_allowScrolling) return;
          for( var i = 0; i < _ul.children.length; i ++) {
              if( _ul.children[i].classList.value == 'selected'){
                 if( ( i + shift >= 0 ) && (shift + i <= _ul.children.length-1 ) ){// borders
                  unselectElement();
                  // for right scrolling up and down
                  if( Math.abs(shift) == _countOfPhotosInRow || 
                    (Math.abs(shift) != _countOfPhotosInRow && shift > 0 && (i + shift) % _countOfPhotosInRow == 0) 
                    || (Math.abs(shift) != _countOfPhotosInRow && shift < 0 && (i + shift + 1 ) % _countOfPhotosInRow == 0)){ 
                     _allowScrolling = false; // preventing multiple scrolling
                      setTimeout(function() { 
                      doScrolling(_ul.children[i+shift], _scrollDuration, shift);
                      _ul.children[i+shift].classList.add("selected");  
                      _allowScrolling = true;
                     }, 100);
                  }else{
                       _ul.children[i+shift].classList.add("selected");
                  }
                   if( i + shift + _countOfPhotosInRow >= _ul.children.length ){ // if we close to new page
                     clearMemory(_nextPage);
                      setTimeout(function() {
                         loadPhotos();
                      }, 200); 
                  }
                 return;
               }
           }
         }
      };

      function MouseWheelHandler(e) {
          var e = window.event || e; 
          var delta = Math.max(-_countOfPhotosInRow, Math.min(_countOfPhotosInRow, (e.wheelDelta || -e.detail)));
          setTimeout(function() { 
               moveFocus(-delta);         
              }, _scrollDuration);
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

       function clearMemory(to){
        setTimeout(function() {
           var i = 0;
           while(i<to){
             _ul.removeChild(_ul.children[0]); 
             i++;
            }
        }, 100);
       };
})();

