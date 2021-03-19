# Toxicity Detector
Example app for event-driven containerized workloads built using Docker for Kubernetes/Microservice instances.  

This Sample App detects any toxic behaviour in content on metrics like insult, toxicity, severity and many more using data provided by the user.

## Usage
1. Clone this Repository  
  `$ git clone https://github.com/Accelerator-One/toxicity-detector.git`
2. Download Docker for your environment (if needed)
3. Download npm (if needed)
4. Open the App location in bash/cmd
5. Run the following commands :  
  `$ npm update`  
  `$ npm install`

### Testing App Code
1. Run App locally for testing using below command :  
  `$ node index.js`
2. Open the Application on localhost for PORT 8080
3. Now, you can test the app by using a POST request  
*( You can use the 'test.json' as sample input for your test )*

4. You recieve a JSON response providing all the necessary insights given by the model

### Container Testing
1. You can run the container locally as follows :  
  `$ docker build -t toxicity-detector:dev .`
2. After successful build completion, test container using following command :  
  `$ docker run -p 4000:8080 --name local-test toxicity-detector:dev`  
3. View the docker processes running as follows on other bash terminal instance :  
  `$ docker ps -a`  
4. Killing the container process :  
  `$ docker kill <YOUR_CONTAINER_PROCESS>`
5. Test using JSON data in your bash :  
	`$ curl 0.0.0.0:4000 'Content-type: application/json; charset=UTF-8' -d '@test.json'`

## Deployment
Now, deploy on your kubernetes/microservice instance as per specifics of your own Cloud Provider.  
Feel free to deploy your own node app using this repository as a wrapper.  

### In case of any problems, feel free to flag it under 'ISSUES' section of this repository
