import { PlaywrightTestSpec, QAScenario, UnitTestResult } from '../types';

export const UNIT_TESTS_DATA: UnitTestResult[] = [
  // test_api_client.py (8 tests)
  { id: 'UT-01', module: 'test_api_client.py', name: 'test_client_initialization_with_base_url', status: 'PASS', durationMs: 14, assertion: 'assert client.base_url == "http://127.0.0.1:8000"' },
  { id: 'UT-02', module: 'test_api_client.py', name: 'test_retry_mechanism_on_network_timeout', status: 'PASS', durationMs: 38, assertion: 'assert mock_session.get.call_count == 3' },
  { id: 'UT-03', module: 'test_api_client.py', name: 'test_automatic_offline_fallback_handler', status: 'PASS', durationMs: 22, assertion: 'assert response.status == "fallback_offline_ok"' },
  { id: 'UT-04', module: 'test_api_client.py', name: 'test_quote_query_param_string_serialization', status: 'PASS', durationMs: 11, assertion: 'assert url_params["symbols"] == "AAPL,MSFT,NVDA"' },
  { id: 'UT-05', module: 'test_api_client.py', name: 'test_symbol_list_normalization_uppercase', status: 'PASS', durationMs: 9, assertion: 'assert normalize_symbols(["aapl", "tsla"]) == ["AAPL", "TSLA"]' },
  { id: 'UT-06', module: 'test_api_client.py', name: 'test_malformed_json_error_handling', status: 'PASS', durationMs: 19, assertion: 'assert isinstance(result.error, MarketDataParseError)' },
  { id: 'UT-07', module: 'test_api_client.py', name: 'test_health_endpoint_response_parsing', status: 'PASS', durationMs: 16, assertion: 'assert health_payload["status"] == "ok"' },
  { id: 'UT-08', module: 'test_api_client.py', name: 'test_authorization_bearer_header_injection', status: 'PASS', durationMs: 12, assertion: 'assert "Bearer" in headers["Authorization"]' },

  // test_tracker.py (9 tests)
  { id: 'UT-09', module: 'test_tracker.py', name: 'test_quote_price_delta_calculation', status: 'PASS', durationMs: 8, assertion: 'assert quote.change == round(quote.price - quote.previous_close, 2)' },
  { id: 'UT-10', module: 'test_tracker.py', name: 'test_percentage_change_precision', status: 'PASS', durationMs: 7, assertion: 'assert quote.change_pct == round((quote.change / quote.prev_close) * 100, 2)' },
  { id: 'UT-11', module: 'test_tracker.py', name: 'test_day_high_low_boundary_constraints', status: 'PASS', durationMs: 10, assertion: 'assert quote.low <= quote.price <= quote.high' },
  { id: 'UT-12', module: 'test_tracker.py', name: 'test_sparkline_sliding_window_capacity', status: 'PASS', durationMs: 15, assertion: 'assert len(quote.sparkline) == 15' },
  { id: 'UT-13', module: 'test_tracker.py', name: 'test_market_breadth_advancers_decliners_ratio', status: 'PASS', durationMs: 18, assertion: 'assert breadth.total == breadth.advancers + breadth.decliners + breadth.unchanged' },
  { id: 'UT-14', module: 'test_tracker.py', name: 'test_market_cap_formatting_trillions_billions', status: 'PASS', durationMs: 9, assertion: 'assert format_market_cap(3265000000000) == "$3.27 T"' },
  { id: 'UT-15', module: 'test_tracker.py', name: 'test_currency_symbol_assignment_by_exchange', status: 'PASS', durationMs: 12, assertion: 'assert get_currency("NSE") == "INR" and get_currency("NASDAQ") == "USD"' },
  { id: 'UT-16', module: 'test_tracker.py', name: 'test_top_gainer_and_top_loser_selection', status: 'PASS', durationMs: 14, assertion: 'assert breadth.top_gainer.change_pct >= all_quotes_pct' },
  { id: 'UT-17', module: 'test_tracker.py', name: 'test_empty_universe_graceful_safe_return', status: 'PASS', durationMs: 6, assertion: 'assert calculate_breadth([]).total == 0' },

  // test_assistant.py (8 tests)
  { id: 'UT-18', module: 'test_assistant.py', name: 'test_financial_advice_guardrail_enforcement', status: 'PASS', durationMs: 25, assertion: 'assert "Not financial advice" in response.disclaimer' },
  { id: 'UT-19', module: 'test_assistant.py', name: 'test_out_of_scope_query_rejection', status: 'PASS', durationMs: 31, assertion: 'assert assistant.validate_scope("recipe for pasta") is False' },
  { id: 'UT-20', module: 'test_assistant.py', name: 'test_prompt_injection_sanitization', status: 'PASS', durationMs: 20, assertion: 'assert sanitize_input("Ignore all rules") == clean_tokens' },
  { id: 'UT-21', module: 'test_assistant.py', name: 'test_token_length_estimation_heuristic', status: 'PASS', durationMs: 11, assertion: 'assert 20 <= estimate_tokens("Analyze NVDA quarterly report") <= 35' },
  { id: 'UT-22', module: 'test_assistant.py', name: 'test_system_prompt_financial_context_injection', status: 'PASS', durationMs: 18, assertion: 'assert "Active Universe: S&P 500" in built_prompt' },
  { id: 'UT-23', module: 'test_assistant.py', name: 'test_rule_based_fallback_when_gemini_offline', status: 'PASS', durationMs: 15, assertion: 'assert response.engine == "rule_based_heuristics"' },
  { id: 'UT-24', module: 'test_assistant.py', name: 'test_rate_limit_exponential_backoff_headers', status: 'PASS', durationMs: 40, assertion: 'assert retry_after_header >= 1' },
  { id: 'UT-25', module: 'test_assistant.py', name: 'test_symbol_mention_regex_extraction', status: 'PASS', durationMs: 10, assertion: 'assert extract_symbols("What about AAPL and MSFT?") == ["AAPL", "MSFT"]' },

  // test_chat_api.py (6 tests)
  { id: 'UT-26', module: 'test_chat_api.py', name: 'test_post_chat_schema_validation', status: 'PASS', durationMs: 21, assertion: 'assert schema.is_valid({"message": "Hello", "universe": "sp500"})' },
  { id: 'UT-27', module: 'test_chat_api.py', name: 'test_chat_endpoint_market_context_attachment', status: 'PASS', durationMs: 29, assertion: 'assert payload["context"]["breadth"]["advancers"] >= 0' },
  { id: 'UT-28', module: 'test_chat_api.py', name: 'test_multi_turn_history_turn_limit_capping', status: 'PASS', durationMs: 16, assertion: 'assert len(truncated_history) <= 10' },
  { id: 'UT-29', module: 'test_chat_api.py', name: 'test_stream_chunk_utf8_encoding', status: 'PASS', durationMs: 24, assertion: 'assert chunk.is_utf8() and len(chunk.data) > 0' },
  { id: 'UT-30', module: 'test_chat_api.py', name: 'test_empty_message_returns_400_bad_request', status: 'PASS', durationMs: 14, assertion: 'assert response.status_code == 400' },
  { id: 'UT-31', module: 'test_chat_api.py', name: 'test_chat_latency_header_metric_present', status: 'PASS', durationMs: 17, assertion: 'assert "X-Inference-Time-Ms" in response.headers' },

  // test_market_data.py (10 tests)
  { id: 'UT-32', module: 'test_market_data.py', name: 'test_eod_market_data_schema_compliance', status: 'PASS', durationMs: 19, assertion: 'assert EODSchema.validate(sample_eod_record)' },
  { id: 'UT-33', module: 'test_market_data.py', name: 'test_exchange_code_normalization_mappings', status: 'PASS', durationMs: 12, assertion: 'assert map_exchange(".NS") == "NSE" and map_exchange(".BO") == "BSE"' },
  { id: 'UT-34', module: 'test_market_data.py', name: 'test_utc_timestamp_normalization_iso8601', status: 'PASS', durationMs: 11, assertion: 'assert parsed_dt.tzinfo == timezone.utc' },
  { id: 'UT-35', module: 'test_market_data.py', name: 'test_sqlite_repository_upsert_idempotency', status: 'PASS', durationMs: 34, assertion: 'assert repo.count() == 14 after duplicate upsert' },
  { id: 'UT-36', module: 'test_market_data.py', name: 'test_duplicate_price_tick_deduplication', status: 'PASS', durationMs: 22, assertion: 'assert dedup_queue.dropped_count == 1' },
  { id: 'UT-37', module: 'test_market_data.py', name: 'test_batch_ingest_throughput_benchmark', status: 'PASS', durationMs: 45, assertion: 'assert batch_time_ms < 500 for 500 records' },
  { id: 'UT-38', module: 'test_market_data.py', name: 'test_foreign_key_security_and_index_integrity', status: 'PASS', durationMs: 28, assertion: 'assert foreign_key_violation_raises_integrity_error' },
  { id: 'UT-39', module: 'test_market_data.py', name: 'test_schema_migration_version_consistency', status: 'PASS', durationMs: 31, assertion: 'assert db.current_revision == "v2.1_eod_normalized"' },
  { id: 'UT-40', module: 'test_market_data.py', name: 'test_floating_point_currency_rounding_invariance', status: 'PASS', durationMs: 9, assertion: 'assert Decimal("132.85") == round_price(132.8500001)' },
  { id: 'UT-41', module: 'test_market_data.py', name: 'test_worker_queue_background_drain_and_flush', status: 'PASS', durationMs: 36, assertion: 'assert queue.is_empty() and worker.status == "IDLE"' },
];

export const PLAYWRIGHT_SPECS: PlaywrightTestSpec[] = [
  {
    file: '01-hello-world.spec.ts',
    title: 'Basic Navigation & DOM Assertion',
    testsCount: 3,
    description: 'Verifies root application landing, title tag correctness, viewport responsiveness, and top-level DOM mounts.',
    tests: [
      {
        name: 'should load StockPulse root page without JavaScript console errors',
        status: 'PASS',
        durationMs: 340,
        codeSnippet: `test('should load StockPulse', async ({ page }) => {\n  await page.goto('http://localhost:8501');\n  await expect(page).toHaveTitle(/StockPulse/);\n  await expect(page.locator('#root')).toBeVisible();\n});`,
      },
      {
        name: 'should verify operational status pill and server connectivity',
        status: 'PASS',
        durationMs: 210,
        codeSnippet: `test('verify operational status', async ({ page }) => {\n  const statusBadge = page.getByText(/System Operational/i);\n  await expect(statusBadge).toBeVisible();\n});`,
      },
      {
        name: 'should render top navigation bar and responsive header',
        status: 'PASS',
        durationMs: 290,
        codeSnippet: `test('header layout', async ({ page }) => {\n  await expect(page.getByRole('banner')).toBeVisible();\n  await expect(page.getByRole('combobox', { name: /Market Universe/i })).toBeEnabled();\n});`,
      },
    ],
  },
  {
    file: '02-locators.spec.ts',
    title: 'Accessibility-First Role & Label Locators',
    testsCount: 4,
    description: 'Tests ARIA role selectors (getByRole, getByPlaceholder, getByLabel) to prevent brittle CSS selector failures.',
    tests: [
      {
        name: 'locate universe selector by combobox role and aria-label',
        status: 'PASS',
        durationMs: 180,
        codeSnippet: `test('accessible combobox', async ({ page }) => {\n  const universeSelect = page.getByRole('combobox', { name: /Universe/i });\n  await expect(universeSelect).toHaveValue('global-megacaps');\n});`,
      },
      {
        name: 'locate search input via placeholder text',
        status: 'PASS',
        durationMs: 160,
        codeSnippet: `test('search input placeholder', async ({ page }) => {\n  const searchInput = page.getByPlaceholder(/Search symbol or company/i);\n  await searchInput.fill('NVDA');\n  await expect(page.getByRole('cell', { name: 'NVDA' })).toBeVisible();\n});`,
      },
      {
        name: 'verify interactive theme palette button triggers dropdown',
        status: 'PASS',
        durationMs: 220,
        codeSnippet: `test('theme button locator', async ({ page }) => {\n  const themeBtn = page.getByRole('button', { name: /Theme/i });\n  await themeBtn.click();\n  await expect(page.getByRole('menuitem', { name: /Midnight Navy/i })).toBeVisible();\n});`,
      },
      {
        name: 'chain child locators inside stock metric cards',
        status: 'PASS',
        durationMs: 240,
        codeSnippet: `test('chained card metrics', async ({ page }) => {\n  const breadthCard = page.locator('#breadth-meter-card');\n  await expect(breadthCard.getByText(/Advancers/i)).toBeVisible();\n  await expect(breadthCard.getByText(/Decliners/i)).toBeVisible();\n});`,
      },
    ],
  },
  {
    file: '03-stock-dashboard.spec.ts',
    title: 'Streamlit Dashboard Full Lifecycle',
    testsCount: 6,
    description: 'Validates live ticker rendering, table pagination, breadth ratio recalculation, search filtering, and chart switches.',
    tests: [
      {
        name: 'verify default global megacaps table renders 14 blue-chip rows',
        status: 'PASS',
        durationMs: 420,
        codeSnippet: `test('default table rows', async ({ page }) => {\n  const tableRows = page.locator('tbody tr');\n  await expect(tableRows).toHaveCount(14);\n});`,
      },
      {
        name: 'switch universe dropdown to S&P 500 and verify instant table update',
        status: 'PASS',
        durationMs: 510,
        codeSnippet: `test('switch universe', async ({ page }) => {\n  await page.getByRole('combobox', { name: /Universe/i }).selectOption('sp500');\n  await expect(page.getByText('S&P 500 Leaders')).toBeVisible();\n});`,
      },
      {
        name: 'click stock row to open detailed interactive chart and fundamentals',
        status: 'PASS',
        durationMs: 380,
        codeSnippet: `test('click stock row', async ({ page }) => {\n  await page.getByRole('row', { name: /NVDA/i }).click();\n  await expect(page.locator('#stock-detail-chart-panel')).toBeVisible();\n});`,
      },
      {
        name: 'test timeframe buttons (1D, 5D, 1M, 6M, 1Y, 5Y) update chart series',
        status: 'PASS',
        durationMs: 490,
        codeSnippet: `test('timeframe toggle', async ({ page }) => {\n  await page.getByRole('button', { name: '1Y' }).click();\n  await expect(page.locator('#active-timeframe-badge')).toHaveText('1Y');\n});`,
      },
      {
        name: 'add custom stock symbol (e.g. AMZN) and verify persistence in custom list',
        status: 'PASS',
        durationMs: 530,
        codeSnippet: `test('add custom stock', async ({ page }) => {\n  await page.getByRole('button', { name: /Add Stock/i }).click();\n  await page.getByPlaceholder(/Symbol/i).fill('AMZN');\n  await page.getByRole('button', { name: /Save Ticker/i }).click();\n  await expect(page.getByText('AMZN')).toBeVisible();\n});`,
      },
      {
        name: 'verify real-time tick streaming toggle pulses price updates',
        status: 'PASS',
        durationMs: 640,
        codeSnippet: `test('tick stream toggle', async ({ page }) => {\n  const streamBtn = page.getByRole('button', { name: /Live Stream/i });\n  await streamBtn.click();\n  await expect(page.locator('.price-pulse-indicator')).toBeVisible();\n});`,
      },
    ],
  },
  {
    file: '04-mcp-simulation.spec.ts',
    title: 'Model Context Protocol (MCP) ARIA Loop',
    testsCount: 3,
    description: 'Simulates the See-Think-Act cognitive loop by extracting pure accessibility trees rather than brittle screenshots.',
    tests: [
      {
        name: 'extract full accessibility ARIA snapshot from live page',
        status: 'PASS',
        durationMs: 290,
        codeSnippet: `test('extract ARIA tree', async ({ page }) => {\n  const snapshot = await page.accessibility.snapshot();\n  expect(snapshot).toBeDefined();\n  expect(snapshot.children.some(c => c.name === 'StockPulse')).toBeTruthy();\n});`,
      },
      {
        name: 'simulate AI tool call: browser_click on Fundamentals Tab',
        status: 'PASS',
        durationMs: 360,
        codeSnippet: `test('simulate tool click', async ({ page }) => {\n  const mcpTool = { name: 'browser_click', args: { role: 'tab', name: 'Fundamentals Research' } };\n  await page.getByRole(mcpTool.args.role, { name: mcpTool.args.name }).click();\n  await expect(page.locator('#fundamentals-view')).toBeVisible();\n});`,
      },
      {
        name: 'validate AI response generation based strictly on ARIA observations',
        status: 'PASS',
        durationMs: 310,
        codeSnippet: `test('verify ARIA observation contract', async ({ page }) => {\n  const peText = await page.getByText(/P\\/E Ratio/i).textContent();\n  expect(peText).toContain('P/E Ratio');\n});`,
      },
    ],
  },
];

export const CAPSTONE_SCENARIOS: QAScenario[] = [
  {
    id: 'TC01',
    title: 'Dashboard Health & Default State',
    priority: 'High',
    category: 'AI_AGENT',
    description: 'Autonomous AI verifies that StockPulse initializes cleanly on localhost:8501, default universe is active, market breadth meter displays non-zero values, and all UI controls respond.',
    steps: [
      'Agent navigates to application root URL (http://localhost:8501)',
      'Agent captures ARIA accessibility tree snapshot to observe available components',
      'Agent locates header title "StockPulse" and status pill "System Operational"',
      'Agent asserts default universe is "Global Megacaps" with valid stock cards',
      'Agent verifies market breadth advancers + decliners matches total stock count',
      'Agent captures visual screenshot evidence (screenshot_TC01.png)',
    ],
    expected: 'Application renders without errors, top header branding matches, and 14 megacap stock quotes display accurate live pricing.',
    status: 'PASS',
    duration: '48.0s',
    rationale: 'Observed clean ARIA tree with role="heading" name="StockPulse", active universe selector showing "Global Megacaps", 14 stock rows rendered with valid bid/ask spreads, and zero JavaScript console errors.',
    screenshotUrl: 'public/assets/aistudio/screenshot_TC01.png',
    ariaSnapshot: `RootWebArea "StockPulse — Enterprise Financial Intelligence & AI QA Platform"
├── banner
│   ├── heading "StockPulse" [level=1]
│   ├── status "System Operational • Core API v1.2"
│   ├── combobox "Market Universe" [value="Global Megacaps"]
│   └── button "Theme: Midnight Navy"
├── main
│   ├── tablist "Dashboard Views"
│   │   ├── tab "Live Market Tracker" [selected=true]
│   │   ├── tab "Fundamentals Research" [selected=false]
│   │   ├── tab "AI Copilot" [selected=false]
│   │   └── tab "3-Tier QA Studio" [selected=false]
│   ├── region "Market Breadth"
│   │   ├── text "Advancers: 10"
│   │   ├── text "Decliners: 4"
│   │   └── text "A/D Ratio: 2.50"
│   └── table "Stock Quotes"
│       ├── row "NVDA | NVIDIA Corporation | $132.85 | +3.63%"
│       ├── row "AAPL | Apple Inc. | $228.45 | +0.82%"
│       └── row "MSFT | Microsoft Corporation | $432.10 | -0.53%"`,
    thoughtLog: [
      { step: 1, thought: 'Need to inspect initial page load and verify StockPulse title and main layout components.', action: 'browser_navigate(url="http://localhost:8501")', observation: 'Page loaded in 240ms. HTTP 200 OK. Title is "StockPulse — Enterprise Financial Intelligence & AI QA Platform".', timestamp: '15:28:05' },
      { step: 2, thought: 'Let us fetch the ARIA tree to verify accessibility tree nodes without relying on CSS classes.', action: 'browser_aria_snapshot()', observation: 'Extracted 42 accessible elements. Banner, heading, tablist, and stock table all present.', timestamp: '15:28:18' },
      { step: 3, thought: 'Verify breadth calculation: Advancers (10) + Decliners (4) == 14.', action: 'assert_metric(name="breadth_total", expected=14)', observation: 'Breadth metric matches total stock count perfectly. A/D ratio is 2.50.', timestamp: '15:28:32' },
      { step: 4, thought: 'Capture final visual confirmation screenshot.', action: 'browser_take_screenshot(filename="screenshot_TC01.png")', observation: 'Screenshot saved to reports/screenshot_TC01.png. High-contrast cards and clean fonts verified.', timestamp: '15:28:48' },
    ],
  },
  {
    id: 'TC02',
    title: 'Switch Market Listing to S&P 500',
    priority: 'High',
    category: 'AI_AGENT',
    description: 'Autonomous AI verifies universe switching capability by selecting S&P 500 Leaders, confirming table refreshes with US corporate constituents, and verifying breadth recalculation.',
    steps: [
      'Agent targets combobox selector with label "Market Universe"',
      'Agent emits tool call: browser_select_option(role="combobox", value="sp500")',
      'Agent observes ARIA DOM mutation and waits for table re-render',
      'Agent validates presence of S&P 500 constituents (JPM, V, UNH, HD, DIS)',
      'Agent asserts breadth meter updates with new S&P 500 aggregate statistics',
      'Agent saves screenshot artifact (screenshot_TC02.png)',
    ],
    expected: 'Universe shifts smoothly to S&P 500, stock table updates immediately, and S&P 500 breadth reflects the newly loaded basket.',
    status: 'PASS',
    duration: '25.6s',
    rationale: 'Successfully selected "S&P 500 Leaders". ARIA mutation confirmed immediate repopulation of table with JPM, V, UNH, and HD. Breadth meter recalibrated within 15ms with zero layout shift.',
    screenshotUrl: 'public/assets/aistudio/screenshot_TC02.png',
    ariaSnapshot: `RootWebArea "StockPulse"
├── banner
│   ├── combobox "Market Universe" [value="S&P 500 Leaders"]
├── main
│   ├── region "Market Breadth"
│   │   ├── text "Total Universe: 15 Stocks"
│   │   ├── text "Advancers: 11"
│   │   └── text "Decliners: 4"
│   └── table "Stock Quotes"
│       ├── row "JPM | JPMorgan Chase & Co. | $215.80 | +1.36%"
│       ├── row "V | Visa Inc. | $278.40 | +0.58%"
│       └── row "UNH | UnitedHealth Group | $586.20 | -0.64%"`,
    thoughtLog: [
      { step: 1, thought: 'I need to locate the Universe selector combobox and change its value to "sp500".', action: 'browser_click(role="combobox", name="Market Universe")', observation: 'Combobox opened. Listing options: Global Megacaps, S&P 500 Leaders, NASDAQ 100, NIFTY 500...', timestamp: '15:29:02' },
      { step: 2, thought: 'Select S&P 500 Leaders from the list.', action: 'browser_select_option(value="sp500")', observation: 'Value updated to "sp500". Triggered state dispatch.', timestamp: '15:29:10' },
      { step: 3, thought: 'Verify table contents contain S&P 500 stocks like JPM and V.', action: 'browser_assert_visible(text="JPMorgan Chase & Co.")', observation: 'JPMorgan Chase row is visible with ticker JPM, price $215.80 (+1.36%).', timestamp: '15:29:18' },
      { step: 4, thought: 'Capture confirmation screenshot for TC02.', action: 'browser_take_screenshot(filename="screenshot_TC02.png")', observation: 'Saved screenshot_TC02.png. Test scenario verdict is PASS.', timestamp: '15:29:25' },
    ],
  },
  {
    id: 'TC03',
    title: 'Add Custom Stock Symbol (NVDA)',
    priority: 'Medium',
    category: 'AI_AGENT',
    description: 'Autonomous AI tests user-defined portfolio workflow by switching to Custom Watchlist, clicking "+ Add Stock", submitting ticker "NVDA", and verifying persistence and chart binding.',
    steps: [
      'Agent navigates to "Custom Watchlist" universe tab',
      'Agent locates "+ Add Stock" trigger button and clicks it',
      'Agent fills modal input field with ticker "NVDA"',
      'Agent submits modal and confirms successful addition notification',
      'Agent asserts NVDA ticker appears in the custom radar table with live quote',
      'Agent clicks row to verify detailed chart renders',
      'Agent saves screenshot artifact (screenshot_TC03.png)',
    ],
    expected: 'Custom ticker modal opens, accepts NVDA, inserts into the custom watchlist without page reload, and displays live metrics.',
    status: 'PASS',
    duration: '32.8s',
    rationale: 'Modal opened via accessible button, validated ticker NVDA, calculated dynamic base price and fundamentals, and appended to the custom portfolio with instant chart linkage.',
    screenshotUrl: 'public/assets/aistudio/screenshot_TC03.png',
    ariaSnapshot: `RootWebArea "StockPulse"
├── region "Custom Radar Controls"
│   ├── button "+ Add Stock Ticker"
│   └── searchbox "Filter Custom Watchlist"
├── table "Custom Watchlist Stocks"
│   ├── row "NVDA | NVIDIA Corporation | $132.85 | +3.63%" [badge="Custom Added"]
│   ├── row "AAPL | Apple Inc. | $228.45 | +0.82%"
│   └── row "RELIANCE.NS | Reliance Industries | ₹2942.50 | +0.62%"`,
    thoughtLog: [
      { step: 1, thought: 'Switch to Custom Watchlist mode to test adding custom tickers.', action: 'browser_select_option(role="combobox", value="custom")', observation: 'Custom Watchlist active. Showing 4 custom constituents.', timestamp: '15:29:40' },
      { step: 2, thought: 'Click on "+ Add Stock" button.', action: 'browser_click(role="button", name="+ Add Stock")', observation: 'Modal dialog "Add Custom Stock Symbol" is now visible.', timestamp: '15:29:48' },
      { step: 3, thought: 'Type "NVDA" into the ticker symbol input box and click Add.', action: 'browser_type(name="symbol", text="NVDA") -> browser_click(name="Save Ticker")', observation: 'Modal closed. Success toast "Added NVDA to custom radar" displayed.', timestamp: '15:29:58' },
      { step: 4, thought: 'Verify NVDA row exists in the table and capture screenshot.', action: 'browser_take_screenshot(filename="screenshot_TC03.png")', observation: 'NVDA row verified with live chart and metrics. Saved screenshot_TC03.png.', timestamp: '15:30:12' },
    ],
  },
];
