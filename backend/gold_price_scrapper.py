import os
import logging
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s"
)

class GoldPriceScraper:
    def __init__(self):
        self.driver_path = os.getenv("CHROMEDRIVER_PATH", "C:\\chromedriver-win64\\chromedriver.exe")
        self.driver = None
        logging.info(f"GoldPriceScraper instance created with driver path: {self.driver_path}")

    def start_driver(self):
        logging.info("Starting the driver...")
        chrome_options = Options()
        chrome_options.add_argument("--headless")
        chrome_options.add_argument("--disable-gpu")
        chrome_options.add_argument("--window-size=1920,1080")

        service = Service(self.driver_path)
        self.driver = webdriver.Chrome(service=service, options=chrome_options)
        logging.info("Driver started successfully.")

    def scrape_gold_prices(self, selected_gold_types=None):
        data_dicts = []
        try:
            logging.info("Navigating to the HaremAltin website...")
            self.driver.get("https://www.haremaltin.com/")

            logging.info("Waiting for the gold prices table to load...")
            WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.CLASS_NAME, "table"))
            )
            logging.info("Table loaded successfully.")

            table = self.driver.find_element(By.CLASS_NAME, "table")
            rows = table.find_elements(By.TAG_NAME, "tr")

            for row in rows[1:]:
                row_id = row.get_attribute('id')
                if selected_gold_types and row_id not in selected_gold_types:
                    continue

                cols = row.find_elements(By.TAG_NAME, "td")
                if len(cols) >= 4:
                    gold_type = cols[0].text.split('\n')[0].strip()
                    buy = cols[1].text.replace('.', '').replace(',', '.').strip()
                    sell = cols[2].text.replace('.', '').replace(',', '.').strip()
                    change = cols[3].text.replace('%', '').replace(',', '.').strip()

                    if gold_type and buy and sell:
                        data_dicts.append({
                            'gold_type': gold_type,
                            'buy': float(buy),
                            'sell': float(sell),
                            'change': float(change) if change else 0.0
                        })
                        logging.info(f"Scraped data for {gold_type}: Buy={buy}, Sell={sell}, Change={change}")
        except Exception as e:
            logging.error(f"An error occurred while scraping: {e}")

        return data_dicts

    def close_driver(self):
        if self.driver:
            logging.info("Closing the driver...")
            self.driver.quit()
            logging.info("Driver closed successfully.")
