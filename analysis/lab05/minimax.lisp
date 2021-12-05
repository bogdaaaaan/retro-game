; define wall 
(defparameter wall 1)

; function to create game field
(defun generate_game_field ()
    ; create array[5][5]
    (let ((field (make-array '(5 5))))
        (dotimes (i 5)
            (dotimes (j 5)
                ; set array[i][j] value randomly between 0 and 1
                (setf (aref field i j) (random 2))
            )
	    )
        ; return created array
        (return-from generate_game_field field)
    )
)

; create game field
(defparameter game_field (generate_game_field))

; function to get available (free to pass) squares around character
(defun get_neighbors (field x y)
    ; create list to fill
    (let ((coords_list ()))
        ; from current position check for:
        ; up
        (when (and (>= (- x 1) 0) (/= (aref field (- x 1) y) wall))
            (setq coords_list (append coords_list (list (list (- x 1) y)))))
        ; down
        (when (and (< (+ x 1) 5) (/= (aref field (+ x 1) y) wall))
            (setq coords_list (append coords_list (list (list (+ x 1) y)))))
        ; left
        (when (and (>= (- y 1) 0) (/= (aref field x (- y 1)) wall))
            (setq coords_list (append coords_list (list (list x (- y 1))))))
        ; right
        (when (and (< (+ y 1) 5) (/= (aref field x (+ y 1)) wall))
            (setq coords_list (append coords_list (list (list x (+ y 1))))))
        ; return created list
        (return-from get_neighbors coords_list)
    )
)

; function to calc evaluation value
(defun evaluate (player_x player_y enemy_x enemy_y)
    (let ((evaluation 0))
        ; the far the better
        (setq evaluation (sqrt (+ (expt (- enemy_x player_x) 2) (expt (- enemy_y player_y) 2))))
        (return-from evaluate evaluation)
    )
)

; minimax function
(defun minimax (field maximize player_x player_y enemy_x enemy_y)
    ; set variables like neighbors, evaluation, max, min, coords to move and current enemy position
    (let ((neighbors ()) (evaluation 0) (current_max 10000) (current_min -10000) (best_coords ()) (enemy_coords ()))
        (if maximize
            ; player turn
            (progn
                ; best coords = current player coords, get neighbors for player
                (setq best_coords (list player_x player_y))
                (setq neighbors (get_neighbors field player_x player_y))
                ; going through all neighbors 
                (dolist (coords neighbors)
                    ; get next enemy position if we make a turn to current neighbor
                    (setq enemy_coords (minimax field nil (nth 0 coords) (nth 1 coords) enemy_x enemy_y))
                    ; get value of game with changed positions
                    (setq evaluation (evaluate (nth 0 coords) (nth 1 coords) (nth 0 enemy_coords) (nth 1 enemy_coords)))
                    ; if previous value is worse than new value - change coords to new coords
                    (when (> evaluation current_min)
                        (progn
                            (setq current_min evaluation)
                            (setq best_coords coords)
                        )
                    )
                )
                ; return best value
                (return-from minimax best_coords)
            )
            ; enemy turn
            (progn
                ; best coords = current enemy coords, get neighbors for enemy
                (setq best_coords (list enemy_x enemy_y))
                (setq neighbors (get_neighbors field enemy_x enemy_y))
                ; going through all neighbors 
                (dolist (coords neighbors)
                    ; if we make turn to neighbor - evaluate game state 
                    (setq evaluation (evaluate (nth 0 coords) (nth 1 coords) player_x player_y))
                    ; if evaluated value is worse than previous - set previous to evaluated value
                    (when (< evaluation current_max)
                        (progn
                            (setq current_min evaluation)
                            (setq best_coords coords)
                        )
                    )
                )
                ; return worse value
                (return-from minimax best_coords)
            )
        )
    )
)

; print data 
(print "game field: ")
(print game_field)
(print "minimax: ")
(print (minimax game_field t 0 2 3 2))
