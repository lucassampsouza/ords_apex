# Oracle REST Data Service and APEX Images Folder in Tomcat 8.0 #

For this installation make sure that ORDS have may be installed on database.  
More details on [Oracle ORDS documentation](http://docs.oracle.com/cd/E56351_01/doc.30/e56293/install.htm#CHDDIFEC)

## ENV Variables for automate DEPLOY ##
DATABASE_HOSTNAME = Hostname of database  
DATABASE_PORT = Port of database  
DATABASE_SERVICENAME = Database servicename  
DATABASE_SID = Dabatase SID  
DATABASE_PUBLIC_USERNAME = Public user for APEX (default APEX_PUBLIC_USER)  
DATABASE_PUBLIC_USER_PASS = Password for APEX_PUBLIC_USER  
APEX_LISTENER_PASS = Password for APEX_LISTENER  
APEX_REST_PASS = Password for APEX_REST_PUBLIC_USER  
ORDS_PASS = Password for ORDS_PUBLIC_USER  
  
CONFIGURE_APEX = Enable PL/SQL Gateway APEX - true(default) or false  
CONFIGURE_APEX_REST = Enable APEX RestFull Service - true(default) or false  
CONFIGURE_ORDS = Enable ORDS - true(default) or false  
  
## TAGs ##
> 3.0.1-apex426 - APEX 4.2.6 Images Folder  
> 3.0.1-apex5   - APEX 5.0 Images Folder  
> 3.0.1-apex51  - APEX 5.1 Images Folder  
  
  
## Exemplos de chamada ##
	docker run -t -i \  
		-e DATABASE_HOSTNAME="192.168.0.1" \  
		-e DATABASE_PORT="1521" \  
		-e DATABASE_SERVICENAME="ORCL" \  
		-e DATABASE_PUBLIC_USER_PASS=password123 \  
		-e APEX_LISTENER_PASS=password123 \  
		-e APEX_REST_PASS=password123 \  
		-e ORDS_PASS=password123 \  
		-p 8181:8080 lucassampsouza/ords301_apex:5.0 