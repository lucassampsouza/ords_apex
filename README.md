# Oracle REST Data Service and APEX Images Folder in Tomcat 8.0 #

For this installation make sure that ORDS have may be installed on database.  
More details on [Oracle ORDS documentation](https://docs.oracle.com/cd/E56351_01/doc.30/e56293/install.htm#CHDDIFEC "Oracle ORDS Documentation")
  
If use the **3.0.1** tag the shared volume for images is **/usr/local/tomcat/webapps/i**
  
## ENV Variables for automate DEPLOY ##
> DATABASE_HOSTNAME = Hostname of database  
> DATABASE_PORT = Port of database  
> DATABASE_SERVICENAME = Database servicename  
> DATABASE_SID = Dabatase SID  
> DATABASE_PUBLIC_USERNAME = Public user for APEX (default APEX_PUBLIC_USER)  
> DATABASE_PUBLIC_USER_PASS = Password for APEX_PUBLIC_USER  
> APEX_LISTENER_PASS = Password for APEX_LISTENER  
> APEX_REST_PASS = Password for APEX_REST_PUBLIC_USER  
> ORDS_PASS = Password for ORDS_PUBLIC_USER  
>   
> CONFIGURE_APEX = Enable PL/SQL Gateway APEX - true(default) or false  
> CONFIGURE_APEX_REST = Enable APEX RestFull Service - true(default) or false  
> CONFIGURE_ORDS = Enable ORDS - true(default) or false  
  
## VOLUMES ##
>  **/opt** - This volume contains de *ORDS* folder with the config files (default.xml)  
>  **/usr/local/tomcat/webapps/i** - This volume contain images files (just use on *3.0.1* TAG)

## TAGs ##
> **3.0.1-apex426** - APEX 4.2.6 Images Folder  
> **3.0.1-apex5**   - APEX 5.0 Images Folder  
> **3.0.1-apex501** - APEX 5.0.1 Images Folder  
> **3.0.1**         - Using your own image file (--volume options)  
> **3.0.5-apex501** - APEX 5.0.1 Images Folder  
> **3.0.5-apex503** - APEX 5.0.3 Images Folder  
> **3.0.6-apex503** - APEX 5.0.3 Images Folder  
> **3.0.6-apex504** - APEX 5.0.4 Images Folder  
> **3.0.9-apex51**  - APEX 5.1 Images Folder  
> **3.0.9**         - Using your own image file (--volume options)
  
  
## Example ##
	docker run -t -i \  
		-e DATABASE_HOSTNAME="192.168.0.1" \  
		-e DATABASE_PORT="1521" \  
		-e DATABASE_SERVICENAME="ORCL" \  
		-e DATABASE_PUBLIC_USER_PASS=password123 \  
		-e APEX_LISTENER_PASS=password123 \  
		-e APEX_REST_PASS=password123 \  
		-e ORDS_PASS=password123 \  
		-p 8181:8080 lucassampsouza/ords_apex:3.0.1-apex5  
  
## Example using your own image files ##
	docker run -t -i \  
		-e DATABASE_HOSTNAME="192.168.0.1" \  
		-e DATABASE_PORT="1521" \  
		-e DATABASE_SERVICENAME="ORCL" \  
		-e DATABASE_PUBLIC_USER_PASS=password123 \  
		-e APEX_LISTENER_PASS=password123 \  
		-e APEX_REST_PASS=password123 \  
		-e ORDS_PASS=password123 \  
		--volume /opt/apex/images:/usr/local/tomcat/webapps/i \  
		-p 8181:8080 lucassampsouza/ords_apex:3.0.1