import os
import logging
from datetime import datetime
from flask_apscheduler import APScheduler

from gold_price_scrapper import GoldPriceScraper
from database import DatabaseManager

class SchedulerConfig:
    SCHEDULER_API_ENABLED = True

scheduler = APScheduler()

def init_scheduler(app):
    app.config.from_object(SchedulerConfig())
    scheduler.init_app(app)
    scheduler.start()

@scheduler.task('interval', id='scrape_job', seconds=int(os.getenv('SCRAPE_INTERVAL_SECONDS', 30)))
def scheduled_scrape():
    try:
        logging.info("Scheduled scrape job started.")
        scraper = GoldPriceScraper()
        scraper.start_driver()

        selected_ids = [
            "tr__AYAR14","tr__ALTIN","tr__AYAR22",
            "tr__CEYREK_YENI","tr__CEYREK_ESKI",
            "tr__YARIM_YENI","tr__YARIM_ESKI",
            "tr_YARIM_YENI","tr__TEK_ESKI"
        ]
        gold_prices = scraper.scrape_gold_prices(selected_gold_types=selected_ids)
        scraper.close_driver()

        if gold_prices:
            db = DatabaseManager()
            db.insert_gold_prices(gold_prices)
            logging.info(f"{len(gold_prices)} records inserted at {datetime.now()}")
        else:
            logging.warning("No gold prices scraped, nothing inserted.")

    except Exception as e:
        logging.error(f"Scheduled scraping failed: {e}")
