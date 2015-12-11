# Sauron Collector

Lambda codes for collect logs from AWS CloudWatch

## AMI Setting

Lambda function needs permission to access CloudWatch.  
Instead of AccessId and SecretKey, use follwing AMI policy from [docs](http://docs.aws.amazon.com/AmazonCloudWatch/latest/DeveloperGuide/UsingIAM.html#UsingWithCloudWatch_Actions)

```json
{
  "Version": "2012-10-17",
  "Statement":[{
      "Effect":"Allow",
      "Action":["cloudwatch:GetMetricStatistics","cloudwatch:ListMetrics"],
      "Resource":"*",
      "Condition":{
         "Bool":{
            "aws:SecureTransport":"true"
            }
         }
      }
   ]
}
```

## Deploying

Please be careful not to zip folder, *lambda* expects only contents to be zipped.  
In OSX, choosing multiple files and compress them using default archive utility led me repeated error.  
I **strongly** recommend using commands like below
```sh
zip -r ../collect.zip *
```
or
```sh
./pack.sh
```
