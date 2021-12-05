;(ql:quickload :cl-csv)
;(ql:quickload "parse-float")

(use-package :parse-float)

; get dataset from csv
(defvar dataset  (cl-csv:read-csv #P"C:\\Users\\bodya\\Desktop\\lab05_LISP\\game_data.csv"))
(print dataset)

; function to get scores from dataset
(defun get-score-list (dataset)
    (let ((score-list ()))
        (dolist (el (cdr dataset))
            ; get 2 column from dataset and write all data from it to score-list
            (setq score-list (append score-list (list (parse-float (nth 2 el))))))
        (return-from get-score-list score-list)
    )
)

; function to get time from dataset
(defun get-time-list (dataset)
    (let ((time-list()))
        (dolist (el (cdr dataset))
            ; get 1 column from dataset and write all data from it to time-list
            (setq time-list (append time-list(list (parse-float (nth 1 el))))))
        (return-from get-time-list time-list)
    )
)

; function to calculate expected value
(defun get-expected-value (list-of-numbers)
    (let ((sum 0))
        (dolist (el list-of-numbers)
            (setq sum (+ sum el)))
        ; expected value  = sum of all elements in list divided by length of list
        (return-from get-expected-value (/ sum (list-length list-of-numbers)))
    )
)

; function to calculate dispersion
(defun get-dispersion (list-of-numbers)
    ; get expected value of scores
    (let ((list-in-square ()) (mean (get-expected-value list-of-numbers)))
        (dolist (el list-of-numbers)
            ; raise all elements from list to the power of two
            (setq list-in-square (append list-in-square (list (* el el))))
        )
        ; dispersion = expected value of scores powered of two - expected value raised to power of two  
        (return-from get-dispersion (- (get-expected-value list-in-square) (* mean mean)))
    )
)

; print data
(print (get-score-list dataset))
(print (get-time-list dataset))

(print "Expected value of time:")
(print (get-expected-value (get-time-list dataset)))

(print "Dispersion of score:")
(print (get-dispersion (get-score-list dataset)))
