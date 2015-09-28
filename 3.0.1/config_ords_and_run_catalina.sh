#!/bin/bash
set -e

file="/opt/defaults.xml"
if [ -f "$file" ]
then
	echo "$file found."
else
	echo "$file not found."
	mkdir $TOMCAT_HOME/webapps/params

	echo "db.hostname=$DATABASE_HOSTNAME" >> $TOMCAT_HOME/webapps/params/ords_params.properties
	echo "db.password=$DATABASE_PUBLIC_USER_PASS" >> $TOMCAT_HOME/webapps/params/ords_params.properties
	echo "db.port=$DATABASE_PORT" >> $TOMCAT_HOME/webapps/params/ords_params.properties
	echo "db.servicename=$DATABASE_SERVICENAME" >> $TOMCAT_HOME/webapps/params/ords_params.properties
	echo "db.sid=$DATABASE_SID" >> $TOMCAT_HOME/webapps/params/ords_params.properties
	echo "db.username=$DATABASE_PUBLIC_USERNAME" >> $TOMCAT_HOME/webapps/params/ords_params.properties
	echo "migrate.apex.rest=false" >> $TOMCAT_HOME/webapps/params/ords_params.properties
	echo "plsql.gateway.add=$CONFIGURE_APEX" >> $TOMCAT_HOME/webapps/params/ords_params.properties
	echo "rest.services.apex.add=$CONFIGURE_APEX_REST" >> $TOMCAT_HOME/webapps/params/ords_params.properties
	echo "rest.services.ords.add=$CONFIGURE_ORDS" >> $TOMCAT_HOME/webapps/params/ords_params.properties
	echo "standalone.mode=false" >> $TOMCAT_HOME/webapps/params/ords_params.properties
	echo "user.apex.listener.password=$APEX_LISTENER_PASS" >> $TOMCAT_HOME/webapps/params/ords_params.properties
	echo "user.apex.restpublic.password=$APEX_REST_PASS" >> $TOMCAT_HOME/webapps/params/ords_params.properties
	echo "user.public.password=$ORDS_PASS" >> $TOMCAT_HOME/webapps/params/ords_params.properties

	java -jar $TOMCAT_HOME/webapps/ords.war
fi

exec catalina.sh "$1"
