Command: `echo "<h2>hostname: $(hostname)</h2> <br> <h2>IP: $(hostname -i)</h2>" >index.html`

# Dashboard
Generate token
`kubectl create token dashboard --duration=2000h`

# Loadbalancer
`kubectl apply -f https://raw.githubusercontent.com/openelb/openelb/master/deploy/openelb.yaml`