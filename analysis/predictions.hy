; connect libraries
(import [numpy :as np]
        [matplotlib [pyplot :as plt]]
        [seaborn :as sns]
        [pandas :as pd]
        [sklearn.preprocessing [OrdinalEncoder]]
        [sklearn.model_selection [train_test_split]]
        [sklearn.linear_model [LinearRegression]]
        [sklearn.metrics [r2_score]]
)

; get [win, time, algorithm] and [score] columns
(defn split_data [data]
    [(data.drop "Score" :axis 1) data.Score])

; display score to time values
(defn plot_time_score_pairplot[data]
    (setv figure (sns.lmplot :x "Time" :y "Score" :hue "Win" :data data))
    (plt.show)
)

(setv data (pd.read_csv "./game_data.csv" ))
; print part of our csv dataset
(print (data.head))

; get 10 lines of dataset to be test data and other to be train values
(setv test_data (cut data 0 10))
(setv train_data (cut data 10 (len data)))

; print graph with time/win to score values
(plot_time_score_pairplot train_data)

; get score value = y, and other values = x
(setv x (get (split_data train_data) 0))
(setv y (get (split_data train_data) 1))

; split our train data on 80% of train and 20% of test data
(setv split (train_test_split x y :test_size 0.2 :shuffle True))

; set our variables from splitted train data
(setv x_train (get split 0))
(setv x_test (get split 1))
(setv y_train (get split 2))
(setv y_test (get split 3))

; create model to train
(setv model (LinearRegression))
(model.fit x_train y_train)

; get predioction about score values of next games
(setv y_pred (model.predict x))

; set test variables from our 10 fetched lines
(setv x_valid (get (split_data test_data) 0))
(setv y_valid (get (split_data test_data) 1))

; R^2 - coefficient of determination is showing how calculated results are close to real data
(print (+ "R2 score: " (str(r2_score y y_pred))))

; get predictions about 10 selected lines of data
(setv y_pred_valid (model.predict x_valid))
; display results
(setv stats (pd.DataFrame {
    "win" x_valid.Win
    "time" x_valid.Time
    "algorithm" x_valid.Algorithm
    "score" y_valid
    "prediction" y_pred_valid
    }))

(print stats)
