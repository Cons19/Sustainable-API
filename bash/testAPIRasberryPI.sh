	#!/bin/bash

	# only real time
	TIMEFORMAT=%R
	LOGFILE="results/runtime.log"

	run_files() {
		  
		for file in $1
		do 
			for i in 1 2 3
			do
				for j in 1 2 3 4 5 6 7 8 9 10 11 12 13 14 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30
				do
					while IFS= read -r line; do
							echo "\nCurl command: curl" $line
							curl $line
							sleep 60
					done < $file
					echo "\n--------------------------------: j:"$j
			                echo $j"[$(date)]" >> $LOGFILE		
				done
				echo "\n================================: i:"$i 
				sleep 300
			done
		done

	}

	rm -f $LOGFILE

	pwd >> $LOGFILE
	echo "[$(date)]" >> $LOGFILE

	# Express
	sleep 300
	# run_files "executables/express/employees.txt"
	# run_files "executables/express/departments.txt"
	# Nest
	# run_files "executables/nest/employees.txt"
	run_files "executables/nest/departments.txt"
	# Fastify
	run_files "executables/fastify/employees.txt"
	run_files "executables/fastify/departments.txt"
	# Koa
	run_files "executables/koa/employees.txt"
	run_files "executables/koa/departments.txt"

	echo "done"
	cat $LOGFILE
