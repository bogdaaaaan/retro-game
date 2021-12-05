;(ql:quickload :cl-csv)
;(ql:quickload "parse-float")

(use-package :parse-float)

; get dataset from csv
(defvar dataset  (cl-csv:read-csv #P"C:\\Users\\bodya\\Desktop\\lab05_LISP\\game_data.csv"))
(print dataset)

; function to get scores from dataset
(defun get_score_list (dataset)
    (let ((score_list ()))
        (dolist (el (cdr dataset))
            ; get 2 column from dataset and write all data from it to score_list
            (setq score_list (append score_list (list (parse-float (nth 2 el))))))
        (return-from get_score_list score_list)
    )
)

; function to get time from dataset
(defun get_time_list (dataset)
    (let ((time_list()))
        (dolist (el (cdr dataset))
            ; get 1 column from dataset and write all data from it to time_list
            (setq time_list (append time_list(list (parse-float (nth 1 el))))))
        (return-from get_time_list time_list)
    )
)

; function to calculate expected value
(defun get_expected_value (list_of_numbers)
    (let ((sum 0))
        (dolist (el list_of_numbers)
            (setq sum (+ sum el)))
        ; expected value  = sum of all elements in list divided by length of list
        (return-from get_expected_value (/ sum (list-length list_of_numbers)))
    )
)

; function to calculate dispersion
(defun get_dispersion (list_of_numbers)
    ; get expected value of scores
    (let ((list_in_square ()) (mean (get_expected_value list_of_numbers)))
        (dolist (el list_of_numbers)
            ; raise all elements from list to the power of two
            (setq list_in_square (append list_in_square (list (* el el))))
        )
        ; dispersion = expected value of scores powered of two - expected value raised to power of two  
        (return-from get_dispersion (- (get_expected_value list_in_square) (* mean mean)))
    )
)

; print data
(print (get_score_list dataset))
(print (get_time_list dataset))

(print "Expected value of time:")
(print (get_expected_value (get_time_list dataset)))

(print "Dispersion of score:")
(print (get_dispersion (get_score_list dataset)))
