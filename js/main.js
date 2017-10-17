'use strict';

let Popup;

(function() {
    const view = {
        dragAndDropZone : document.getElementById('draganddropZone'),
        fileList : document.getElementById('filesContainer'),
        popup : document.getElementById('fileuploader-popup'),
        createElement : function(tag, attrObject, ...children) {
            let element = document.createElement(tag);
            for (let key in attrObject) {
                element.setAttribute(key, attrObject[key]);
            }
            children.forEach(e => {
                if (typeof e === 'string') {
                    element.innerHTML = e;
                } else {
                    element.appendChild(e);
                }
            });
            return element;
        }
    };

    const thePopup = {
        modified : false,
        veiw : {
            node : view.popup,
            render : function() {
                
            }
        },
        show : function() {
            this.veiw.node.classList.add('active');
        },
        setData : function(data) {
            if (data !== this.data) {
                let node = new Image();
                node.src = data.url;
                this.node = node;
                this.hight = node.height;
                this.width = node.width;
                this.modified = false;
                this.data = data;
            }
        },
        getData : function() {
            return ;
        }
    };

    Popup = thePopup;
    let File = function(file) {
        this.file = file;
        this.name = file.name;
        this.size = file.size;
        this.url = URL.createObjectURL(file);

        this.handleDelete = (event) => {
            let timerID;
            this.view.classList.add('deletingAnimation');
            event.currentTarget.removeEventListener('click', this.handleDelete);
            timerID = setTimeout(() => {
                this.view.parentElement.removeChild(this.view);
                this.view = null;
                URL.revokeObjectURL(this.url);
                fileList.remove(this);
                clearTimeout(timerID);
            }, 800);
        };
    }

    File.MAXSize = 0;
    File.prototype.KBsize = 1024;
    File.prototype.MBsize = 1048576;
    File.prototype.getSize = function() {
        if (this.size > this.MBsize) {
            return (this.size/this.MBsize).toFixed(2) + ' MB'
        } else if (this.size === this.MBsize) {
            return '1 MB';
        } else if (this.size > this.KBsize) {
            return (this.size/this.KBsize).toFixed(2) + ' KB'
        } else if (this.size === this.KBsize) {
            return '1 KB';
        }  else {
            return '~1 KB';
        }
    };
    File.prototype.getName = function() {
        return this.name;
    };
    File.prototype.getURL = function() {
        return this.url;
    };
    File.prototype.render = function() {
        let
            container,
            icon = view.createElement('span', {'class' : 'icon'}),
            deleteButton = view.createElement('button', {}, '<i class="fa fa-check" aria-hidden="true"></i>'),
            title = view.createElement('span', {'class' : 'fileName'}, this.getName()),
            size = view.createElement('span', {'class' : 'size'}, this.getSize()),
            fileInfo = view.createElement('span', {'class' : 'fileInfo'}, title, size)
        ;
            
        icon.style.backgroundImage = `url('${this.getURL()}')`;
        icon.contextRef = this;
        deleteButton.addEventListener('click', this.handleDelete);
            
        container = view.createElement('li', {}, icon, fileInfo, deleteButton);
        this.view = container;
        return container;
    };
    
    let
        theInputStorage = {
            _currentFileInput : null,
            store : [],
            createFileInput : function() {
                let input = document.createElement('input');
                input.setAttribute('type', 'file');
                input.setAttribute('multiple', '');

                input.addEventListener('change', event => {
                    let target = event.target;

                    Array.prototype.forEach.call(target.files, e => {
                        let type = e.type.match(/image\/(.*)/);
                        if (type) {
                            let file = new File(e);
                            fileList.add(file);
                        }
                    });
                    this.store.push(target);
                    target.parentElement.removeChild(target);
                    this.createFileInput();
                });

                this.currentFileInput = input;
                view.dragAndDropZone.appendChild(input);

            },
            set currentFileInput(value) {
                this._currentFileInput = value;
            },
            get currentFileInput() {
                return this._currentFileInput;
            }
        },
        fileList = {
            storage : [],

            add : function(file) {
                this.storage.push(file);
                this.render(file);
            },
            remove : function(file) {
                let index = this.storage.indexOf(file);
                this.storage.splice(index, 1);
            },
            render : function(file) {
                view.fileList.appendChild(file.render());
            }
        }

    theInputStorage.createFileInput();

    view.dragAndDropZone.addEventListener('dragenter', function() {
        this.classList.add('active');
    });
    view.dragAndDropZone.addEventListener('dragleave', function() {
        this.classList.remove('active');
    });
    view.dragAndDropZone.addEventListener('drop', function() {
        this.classList.remove('active');
        document.body.appendChild(theInputStorage.currentFileInput);
    });
    view.fileList.addEventListener('click', function(e) {
        if (e.target.contextRef) {
            thePopup.setData(e.target.contextRef);
            console.log(thePopup);
            thePopup.show();
        }
    });
}());