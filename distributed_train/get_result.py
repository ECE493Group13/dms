import subprocess
from termcolor import colored
import os
from read_credentials import readCredentials

SSH, SCP, user = readCredentials("credentials.txt")

with open('good_hosts', 'r') as f:
    servers = [line.strip() for line in f.readlines()]

processes = []
for i, server in enumerate(servers):
    subprocess.check_output("mkdir -p data_{}".format(i), shell=True)
    proc = subprocess.Popen("{} -r {}@{}:~/word2vec/data data_{}/data".format(SCP, user, server, i).split(), stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    processes.append((server, proc));

for server, proc in processes:
    output, err = proc.communicate()
    if proc.returncode != 0:
        print colored("{} failed scp data".format(server), 'red')

processes = []
for i, server in enumerate(servers):
    proc = subprocess.Popen("{} -r {}@{}:~/word2vec/question_result_eval data_{}/question_result_eval".format(SCP, user, server, i).split(), stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    processes.append((server, proc));

for server, proc in processes:
    output, err = proc.communicate()
    if proc.returncode != 0:
        print colored("{} failed scp data".format(server), 'red')


processes = []
for i, server in enumerate(servers):
    proc = subprocess.Popen("{} -r {}@{}:~/word2vec/similarity_result_eval data_{}/similarity_result_eval".format(SCP, user, server, i).split(), stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    processes.append((server, proc));

for server, proc in processes:
    output, err = proc.communicate()
    if proc.returncode != 0:
        print colored("{} failed scp data".format(server), 'red')


