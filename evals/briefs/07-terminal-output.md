# Terminal output

Write a small Node script that prints the output of a command called **`ship`** that deploys a website. It should print the result of a deploy that succeeded in 21.4 s with 214 files uploaded (3 new, 5 changed), a warning that the build cache was cold, and the live address https://example.com. Also implement the failure case when run with `--fail` (upload failed after 3 retries: connection reset). Output must read well at 60 and 120 columns and with colour switched off. No dependencies.
