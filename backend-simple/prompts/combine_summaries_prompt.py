"""
Prompt template for combining multiple summaries into one coherent summary.
"""

COMBINE_SUMMARIES_PROMPT = """Combine these summaries into a single coherent summary of approximately TARGET_TOKENS tokens. 
Maintain all important information, avoid redundancy, and ensure smooth transitions between topics.

SUMMARIES_TEXT""" 