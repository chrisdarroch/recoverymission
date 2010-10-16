WIW = {};

WIW.Games = (function() {
    
    // initialise constants
    var PAN_RESET = 50;
    
    // initialise module variables
    var games = [
            'easy',
            'blurry',
            'test',
            'blinds',
            'easingblinds',
            'eat',
            'crater',
            'falling'
        ],
        scriptUrls = {},
        loadedGames = {};
    
    
    /* private module functions */
    
    function findGameId(gameName) {
        // look for the name of the game
        for (var ii = games.length; ii--; ) {
            if (games[ii] === gameName) {
                return ii;
            }
        } // for
        
        return undefined;
    } // findGameId
    
    function insertCanvas(container) {
        var canvas = document.createElement('canvas');
        
        // create a canvas element in the dom
        container.get(0).appendChild(canvas);
        
        // size the canvas appropriately
        canvas.width = container.width();
        canvas.height = container.height();
        
        return canvas;
    } // insertCanvas
    
    function loadGame(gameIndex, callback) {
        gameIndex = typeof gameIndex === 'undefined' ? 
            ~~(Math.random() * games.length) : 
            gameIndex;
            
        var gameName = games[gameIndex];
        
        // if the game is already loaded, then just run the callback
        if (loadedGames[gameName]) {
            callback(loadedGames[gameName]);
        }
        else {
            $.getScript(
                'js/games/' + gameName + '.js',
                function(data) {
                    callback(loadedGames[gameName]);
                });
        } // if..else
            
        GT.Log.info("loading game " + gameIndex);
    } // loadGame
    
    function populateSelector(containerSelector, images, player) {
        // create the image html
        var chooseContainer = $(containerSelector + ' .chooser'),
            html = '';
        
        for (var ii = 0; ii < images.length; ii++) {
            html += '<li><img id="playerimg_' + ii + '" src="' + images[ii] + '" /></li>';
        } // for
        
        chooseContainer.html(html);
        
        chooseContainer.find('img').click(function() {
            player.selectImage(this);
        });
        
        T5.captureTouch(chooseContainer.get(0), {
            observable: player
        });
    } // populateSelector
    
    /* define the player */
    
    var Game = function(canvas, params) {
        params = jQuery.extend({
            
        }, params);
        
        var self = {
            
        };
        
        GT.Log.info("test game created");
        return self;
    };
    
    var Player = function(params) {
        params = jQuery.extend({
            container: 'body',
            images: [],
            imageUrl: '',
            winScore: 100,
            penaltyScore: 10,
            correctIndex: 0,
            game: null
        }, params);
        
        /* event handlers */
        
        function handlePan(x, y, inertia) {
            lefty = Math.max(lefty + x, 0);
            allowSelect = false;
            
            chooserContainer.css('margin-left', -lefty + 'px');
            // chooseContainer.css('-webkit-transform', '')
        } // handlePan
        
        function handlePanEnd(x, y) {
            setTimeout(function() {
                allowSelect = true;
            }, 50);
        } // handlePanEnd
        
        function handleGameEnd() {
            $(params.container + ' .game').find('*').remove();
            game = null;
        }

        /* initialise the player */
        
        var canvasContainer = $(params.container + ' .game'),
            chooserContainer = $(params.container + ' .chooser'),
            canvas = insertCanvas(canvasContainer),
            // insert the canvas and get the context (which is a bit silly really)
            context = canvas.getContext('2d'),
            lefty = 0,
            allowSelect = true,
            score = 0,
            game = null,
            image = null,
            gameCreator = null,
            gameId = findGameId(params.game);
            
        var self = {
            selectImage: function(selection) {
                if (allowSelect) {
                    var imageIndex = parseInt(selection.id.replace(/.*_(\d+)$/, '$1'), 10);
                    if (imageIndex === params.correctIndex) {
                        alert('thats correct');
                    } // if
                } // if
            },
            
            getRandomArtifact: function() {
                return ~~(Math.random() * params.images.length);
            },
            
            getArtifactImage: function(index) {
                return $(params.container + ' .chooser img').get(index);
            },
            
            chooseArtifact: function(itemIndex) {
                var correct = itemIndex === params.correctIndex;
                if (correct) {
                    score = score + params.winScore;
                    self.trigger('end');
                }
                else {
                    score = score - params.penaltyScore;
                } // if..else
                
                // update the score
                $('#score').html(score);
            },
            
            startGame: function() {
                game = new gameCreator(self, canvas, image);
            }
        };

        // if the game is not specified, then choose from the list of random games
        loadGame(gameId, function(creatorClass) {
            gameCreator = creatorClass;
            if (gameCreator && image) {
                self.startGame();
            } // if
        });
        
        // load the image
        T5.Images.load(params.imageUrl, function(loadedImage) {
            image = loadedImage;
            if (gameCreator && image) {
                self.startGame();
            } // if
        });
        
        // make the view observable
        GT.observable(self);
        
        // populate selector
        populateSelector(params.container, params.images, self);
        
        // bind some events
        self.bind('pan', handlePan);
        self.bind('panEnd', handlePanEnd);
        
        // bind to the game end handler
        self.bind('end', handleGameEnd);
        
        return self;
    }; // Player definition
    
    /* internal functions */
    
    var module = {
        Player: Player,
        Game: Game,
        
        registerGame: function(gameId, scriptUrl) {
            
        },
        
        initGame: function(gameId, gameCreator) {
            loadedGames[gameId] = gameCreator;
        }
    };
    
    return module;
})();