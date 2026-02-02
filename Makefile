.PHONY: dev build test test-run deploy
.PHONY: check-images verify-images list-no-image list-unlinked remove-backups help

# npm scripts
dev:
	npm run dev

build:
	npm run build

test:
	npm run test

test-run:
	npm run test:run

deploy:
	npm run deploy

# Image / data scripts
check-images:
	node scripts/check-images.js

verify-images:
	node scripts/verify-images.js

list-no-image:
	node scripts/list-no-image.js

list-unlinked:
	node scripts/list-unlinked-images.cjs

remove-backups:
	node scripts/remove-backup-files.js

# Help
help:
	@echo "Usage: make [target]"
	@echo ""
	@echo "npm:        dev build test test-run deploy"
	@echo "scripts:    check-images verify-images list-no-image list-unlinked remove-backups"
	@echo ""
