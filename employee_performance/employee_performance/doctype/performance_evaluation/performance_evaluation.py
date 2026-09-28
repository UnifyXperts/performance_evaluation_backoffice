# Copyright (c) 2026, UnifyXperts and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from frappe.utils import flt


class PerformanceEvaluation(Document):
	def on_submit(self):
		final_score = flt(
			(flt(self.employee_total_score)
			 + flt(self.manager_average_score)
			 + flt(self.overall_performance_rating)) / 3,
			3,
		)
		self.db_set("final_score", final_score)
