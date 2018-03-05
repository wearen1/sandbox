(function () {
    var comp =  function (a, b) {return a == b;}

    Array.prototype.inArray = function (comparator, element) {
        comparator = comparator || comp;
        for (var i = 0; i < this.length; i++) {
            if(comparator(this[i], element)) return true;
        }
        return false;
    }

    Array.prototype.inArrays = function (comparator, elements) {
        if(!elements) return false;
        for (var i = 0; i < elements.length; i++) {
            if(Array.prototype.inArray.call(this, comparator, elements[i])) return true;
        }
        return false;
    }

    Array.prototype.pushUnique = function (comparator, arr) {
        if (!arr) return;
        comparator = comparator || comp;

        for (var i = 0; i < arr.length; i++) {
            if (!this.inArray(comparator, arr[i])) {
                this.push(arr[i]);
            }
        }
    }
})();
