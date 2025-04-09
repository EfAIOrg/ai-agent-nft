# Reporting Guide for Devin.ai Non-Functional Testing

This guide explains how to generate, interpret, and share reports from the Devin.ai non-functional testing framework.

## Report Types

The framework supports several types of reports:

1. **HTML Reports**: Comprehensive test results in a browsable format
2. **JSON Reports**: Machine-readable test results for integration with other tools
3. **Console Reports**: Text-based summaries displayed in the terminal
4. **Coverage Reports**: Code coverage analysis for test code
5. **Performance Visualizations**: Graphs and charts of performance metrics

## Generating Reports

### HTML Reports

To generate an HTML report:

```bash
pytest --html=reports/report.html
```

This creates a self-contained HTML file with test results, including:
- Test pass/fail status
- Test execution time
- Error messages and tracebacks
- Test parameters

### JSON Reports

For machine-readable reports:

```bash
pytest --json-report --json-report-file=reports/report.json
```

This requires the `pytest-json-report` plugin, which is included in the requirements.

### Console Reports

For enhanced console output:

```bash
pytest -v
```

For a summary of test results:

```bash
pytest -v --no-header --no-summary -q
```

### Coverage Reports

To generate code coverage reports:

```bash
pytest --cov=src --cov-report=html:reports/coverage
```

This creates an HTML coverage report in the `reports/coverage` directory.

### Performance Visualizations

Performance test results can be visualized using the built-in utilities:

```bash
python -m src.utils.report_generator --results-file=reports/performance_results.json --output-dir=reports/visualizations
```

## Report Locations

By default, reports are saved to the `reports/` directory. You can customize this location using the `--report-path` command-line option:

```bash
pytest --html=custom/path/report.html
```

## Interpreting Reports

### HTML Report Structure

The HTML report is organized into sections:

1. **Summary**: Overall test results and statistics
2. **Results**: Detailed results for each test
3. **Environment**: Information about the test environment
4. **Logs**: Test execution logs

### Performance Metrics

Performance reports include the following metrics:

- **Response Time**: Average, median, p95, and p99 response times
- **Throughput**: Requests per second
- **Error Rate**: Percentage of failed requests
- **Resource Utilization**: CPU, memory, and network usage

### Scalability Metrics

Scalability reports include:

- **Load Capacity**: Maximum number of concurrent users
- **Scaling Efficiency**: How performance changes with increased load
- **Resource Scaling**: How resource usage scales with workload

### Reliability Metrics

Reliability reports include:

- **Availability**: Percentage of successful requests
- **Error Rate**: Frequency of failures
- **Recovery Time**: Time to recover from failures

## Sharing Reports

### Exporting Reports

Reports can be exported for sharing:

```bash
# Create a ZIP archive of all reports
python -m src.utils.export_reports --output=reports.zip
```

### Continuous Integration Integration

Reports are automatically generated and uploaded as artifacts in GitHub Actions workflows. To access these reports:

1. Go to the GitHub Actions tab in the repository
2. Select the workflow run
3. Download the artifacts from the "Artifacts" section

### Email Reports

To send reports via email (requires configuration):

```bash
python -m src.utils.email_report --report=reports/report.html --recipients=team@example.com
```

## Customizing Reports

### Report Templates

HTML reports can be customized by providing a template:

```bash
pytest --html=reports/report.html --template=templates/custom_template.html
```

### Report Styling

CSS styling can be customized:

```bash
pytest --html=reports/report.html --css=templates/custom_style.css
```

### Report Filtering

To filter what information is included in reports:

```bash
# Include only failed tests
pytest --html=reports/failures.html -v --tb=line --no-header --no-summary -q --only-failed

# Include only specific test categories
pytest --html=reports/performance.html src/tests/performance/
```

## Automated Reporting

### Scheduled Reports

Reports can be generated on a schedule using cron jobs or scheduled GitHub Actions workflows.

The repository includes a GitHub Actions workflow that runs daily and generates reports.

### Threshold Alerts

The framework can be configured to send alerts when metrics exceed thresholds:

```bash
python -m src.utils.monitor_thresholds --config=config/thresholds.yaml
```

## Troubleshooting

### Missing Reports

If reports are not generated:

1. Check that the report directory exists and is writable
2. Verify that required plugins are installed
3. Check for errors in the console output

### Incomplete Reports

If reports are incomplete:

1. Check for test failures that might have interrupted report generation
2. Verify that all test categories were executed
3. Check for disk space issues

## Next Steps

After generating and analyzing reports, consider:

1. Sharing results with stakeholders
2. Addressing any identified issues
3. Updating test thresholds based on results
4. Scheduling regular test runs for ongoing monitoring
