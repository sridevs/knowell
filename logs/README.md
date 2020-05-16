All logs from morgan will be found in access.logs

Yeah dude, it's obvious, why do we even need this file then?

Well, removing the readme will remove the logs directory while pushing into git, which will in turn cause this error --> Error: ENOENT: no such file or directory, open './logs/access.log'
