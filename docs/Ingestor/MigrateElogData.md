# Migration of data from elog to SciLog

You may have data residing in the [electronic logbook system from Stefan Ritt](https://elog.psi.ch/elog/) .
In case you want to migrate this data to SciLog, here is a description of the steps needed. 
Please note that the concrete steps will likely need adjustments to your specific elog notebooks, 
e.g. depending on the structure of the fields that have been used in elog.

The whole process is a 3 step procedure: the example scripts are assuming that you have a working Python environment, e.g. setup via conda.

```
# get the python SDK to talk to elog logbooks
conda install -c paulscherrerinstitute elog
# get the python SDK to talk to SciLog logbooks
TODO pip  install scilog/sdk/python
TODO, add requirments.txt
```

## Step 1: Dump data from elog

```
cd importTools/elog
# create dump file of all entries in elogbook including images
./elogdump.py URL-TO-ELOG-BOOK 
# extract author information form dump files
./collect_authors.py
# and map authors to email address in 
./convert_authors.py
```

## Step 2: Convert to scilog syntax
```
# this step creates the file scilog.json
./e2sci.py
```

## Step 3: Import dumped data to SciLog

```
cd ..
# select the proper env file one for the right destination
source import.env 
# initialize locations and logbooks from proposal data inside SciLog
# this step is highly site specific. 
# In the example this information is fetched from the proposal data stored inside the data catalog
# which itself is derived from the data inside the digital user office.
# For your site you may want to add this information manually instead
./update_locations.py
# now fill the logbooks with data dumped from elog
./importToScilog.py
```

Here is an example import. env files:
```
# for tests on local system
export SCICAT_URL=https://dacat.psi.ch/api/v3
export SCICAT_LOGIN=Users/login
export SCICAT_USERNAME=proposalIngestor
export SCICAT_PWD=....
export SCILOG_URL=http://localhost:3000
export SCILOG_LOGIN=users/login
export SCILOG_USERNAME=scilog-admin@psi.ch
export SCILOG_PWD=....
export SCILOG_DEFAULT_LOGBOOK_ICON=../sci-log-db/src/scilog_config_PSI/default_logbook_icon.jpg

```

