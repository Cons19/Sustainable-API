	#!/bin/bash

	# only real time
	TIMEFORMAT=%R
	LOGFILE="results/runtime.log"

	run_files() {
		  
		for file in $1
		do 
			for i in {1..3}
			do
				for j in {1..3}
				do
					while IFS= read -r line; do
							echo "\nCurl command: curl" $line
							curl $line
							sleep 5
					done < $file
					echo "\n--------------------------------: j:"$j
				done
				echo "\n================================: i:"$i 
				sleep 60
			done
			echo "[$(date)]" >> $LOGFILE		
		done

	}

	rm -f $LOGFILE

	pwd >> $LOGFILE
	echo "[$(date)]" >> $LOGFILE

	# Express
	sleep 60
	run_files "executables/express/employees.txt"
	run_files "executables/express/departments.txt"
	# Nest
	run_files "executables/nest/employees.txt"
	run_files "executables/nest/departments.txt"
	# Fastify
	run_files "executables/fastify/employees.txt"
	run_files "executables/fastify/departments.txt"
	# Koa
	run_files "executables/koa/employees.txt"
	run_files "executables/koa/departments.txt"

	echo "done"
	cat $LOGFILE
