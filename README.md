# Museum Tour

Have you been curious about New York's Metropolitan Museum of Art and the museums at BYU? You can now view the art pieces in BYU's museums and New York without ever getting up from your computer! In this app you can even save a list of your favorite art pieces. Enjoy the tour! 

## Set Up

Subscribe to the following APIs.

1. Persons -v3 API - https://api.byu.edu/store/apis/info?name=Persons&version=v3&provider=BYU/johnrb2&
2. Gallery -v1 API - https://api.byu.edu/store/apis/info?name=Gallery&version=v1&provider=BYU/romrell4&

## Connect to AWS
In order to use this program you must connect to BYU's AWS. To do so:

1. Go to this link and download the AWS CLI version that corresponds to your computer: https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html.
2. Install the BYU AWS login by running pip3 install byu-awslogin.
3. Visit BYU's AWS Login page.
4. After login, you should find the byu-org-trn app. Click on it and then click on command line or programmtic access.
5. Navigate to the "Powershell" tab and copy environmental variables.
6. Paste Powershell Environmental Variables into Powershell terminal.

## Connect to VPN
1. Download the GlobalProtect App.
2. Open the GlobalProtect app.
3. When prompted for VPN Portal Address, enter gp-dc.byu.edu.
4. Click "Connect."
## Download Program Files from Github
6. Clone this Github reposisitory.
7. Open Powershell Terminal on your computer.
8. Change directories until you are in the downloaded repository.
## Install NPM Packages
1. Run npm install.
## Run the program
1. Enter node index into the command line.

## Login
1. Your connection to AWS and VPN are tested.
2. You are asked to input your BYU ID and WSO2 token.

## Main Menu
The user can do any of the following:
1. Add an art piece to your list of favorites.
2. View your gallery of favorites.
3. Remove one or all art pieces from your list of favorites.
4. Quit.

![image](https://user-images.githubusercontent.com/93284846/170536451-ed5ed55e-3a5d-480f-b0a7-4180bcf464fa.png)

## Add an art piece to your list of favorites
1. Choose which museum you would like to visit.
2. Choose which gallery in that museum you would like to see.
3. Choose an art piece in that gallery to view.
4. An image of the selected art piece will pop up in your browser. Confirm if you would like to add it to your list of favorites. 

## View your gallery of favorites
1. Shows you a table with your favorite art pieces.

![image](https://user-images.githubusercontent.com/93284846/170534613-0312f959-3348-4c28-95b0-c4b0d2fb78fb.png)

## Remove one or all art pieces from your list of favorites
1. Choose an art piece you would like to remove.
2. Confirm yes that you would like to proceed.

## Quit
1. This terminates the program.

