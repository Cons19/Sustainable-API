	#!/bin/bash

	# only real time
	TIMEFORMAT=%R
	LOGFILE="results/runtime.log"

	run_files() {
		  
		for file in $1
		do 
			for i in {1..30}
			do
				while IFS= read -r line; do
				    echo "\nCurl command: curl" $line
				    curl $line
				    sleep 60
				done < $file
			 	echo "\n--------------------------------:"$i
			done
			
			echo "[$(date)]" >> $LOGFILE		
		done

	}


	rm -f $LOGFILE

	pwd >> $LOGFILE
	echo "[$(date)]" >> $LOGFILE

	run_files "executables/*"

	echo "done"
	cat $LOGFILE
