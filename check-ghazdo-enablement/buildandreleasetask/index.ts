import tl = require("azure-pipelines-task-lib");
import axios from "axios";

async function run() {
  const area = "Management";
  const apiVersion = "7.2-preview";

  let organization = tl
    .getVariable("System.CollectionUri")
    ?.replace("https://dev.azure.com/", "")
    .replace("/", "");
  let repository = tl.getVariable("Build.Repository.Name");
  let project = tl.getVariable("System.TeamProject");

  // Print values
  console.log(`Repository: ${repository}`);
  console.log(`Project: ${project}`);
  console.log(`Organization: ${organization}`);

  // Get token
  let token = tl.getVariable("System.AccessToken");

  // Make a request
  // GET https://advsec.dev.azure.com/{organization}/{project}/_apis/management/repositories/{repository}/enablement?api-version=7.2-preview.1
  let url = `https://advsec.dev.azure.com/${organization}/${project}/_apis/${area}/repositories/${repository}/enablement?api-version=${apiVersion}`;

  console.log(`URL: ${url}`);

  axios
    .get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((response) => {
      console.log(response.data);
      let advSecEnabled = response.data.advSecEnabled;
      tl.setVariable("advSecEnabled", advSecEnabled);

    })
    .catch((error) => {
      console.error(error);
    });
}

run();
