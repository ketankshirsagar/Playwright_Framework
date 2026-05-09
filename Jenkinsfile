// Jenkinsfile — Declarative pipeline (no Docker)
// Drop into the repo root; Jenkins picks it up automatically (Multibranch / Pipeline job).
//
// Prerequisites on the Jenkins agent:
//   - NodeJS plugin installed in Jenkins, with a tool config named 'NodeJS-20' (or change the name below)
//   - Allure Jenkins plugin (for the allure() step in post)
//   - HTML Publisher plugin (for the publishHTML step)

pipeline {
  agent any                     // runs on any available Jenkins agent

  tools {
    nodejs 'NodeJS-20'          // matches the NodeJS plugin tool config in Jenkins → Manage → Tools
  }

  parameters {
    choice(name: 'PROJECT', choices: ['chromium', 'firefox', 'webkit', 'all'], description: 'Browser')
    string(name: 'GREP', defaultValue: '@smoke', description: 'Tag to run (e.g. @smoke, @regression)')
    string(name: 'WORKERS', defaultValue: '4', description: 'Parallel workers')
  }

  environment {
    CI            = 'true'
    BASE_URL      = credentials('BASE_URL')
    USERNAME      = credentials('TEST_USER')
    PASSWORD      = credentials('TEST_PASSWORD')
  }

  options {
    timeout(time: 30, unit: 'MINUTES')
    ansiColor('xterm')
    timestamps()
  }

  stages {
    stage('Checkout') {
      steps { checkout scm }
    }

    stage('Install dependencies') {
      steps {
        sh 'npm ci'                                // reproducible install from package-lock
        sh 'npx playwright install --with-deps'    // install browsers + system deps
      }
    }

    stage('Test') {
      steps {
        script {
          def projectFlag = params.PROJECT == 'all' ? '' : "--project=${params.PROJECT}"
          sh """
            npx playwright test \
              ${projectFlag} \
              --grep="${params.GREP}" \
              --workers=${params.WORKERS} \
              --reporter=list,html,junit,allure-playwright
          """
        }
      }
    }

    // Sharding pattern (split tests across N nodes — for big suites)
    // Use parallel { } blocks with --shard=1/4, 2/4, 3/4, 4/4
  }

  post {
    always {
      // JUnit XML — surfaces test failures in Jenkins UI
      junit 'test-results/junit.xml'

      // Built-in Playwright HTML report
      publishHTML(target: [
        reportName : 'Playwright Report',
        reportDir  : 'playwright-report',
        reportFiles: 'index.html',
        keepAll    : true,
        alwaysLinkToLastBuild: true,
      ])

      // Allure report — richer dashboard than the default HTML
      // Requires the Allure Jenkins Plugin: https://plugins.jenkins.io/allure-jenkins-plugin/
      allure([
        includeProperties: false,
        jdk             : '',
        properties      : [],
        reportBuildPolicy: 'ALWAYS',
        results         : [[path: 'allure-results']]
      ])

      archiveArtifacts artifacts: 'test-results/**/*, allure-results/**/*', allowEmptyArchive: true
    }
    failure {
      // Slack/Email notification hook
      echo 'Pipeline failed — notify channel'
    }
  }
}
