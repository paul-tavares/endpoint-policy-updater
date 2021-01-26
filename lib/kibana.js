import fetch from 'node-fetch'

const commonHttpHeaders = Object.freeze({
    'kbn-xsrf': 'xxx',
    'Content-Type': 'application/json'
});

// Taken from:
// https://github.com/elastic/kibana/blob/master/x-pack/plugins/fleet/common/constants/routes.ts
const INGEST_API_ROOT = '/api/fleet';
const INGEST_API = {
    PACKAGE_CONFIGS: `${INGEST_API_ROOT}/package_policies`,
    PACKAGE_UPDATE: `${INGEST_API_ROOT}/package_policies/{packagePolicyId}`,
};

export class Kibana {

    constructor({kibanaUrl, kibanaUser, kibanaPassword}) {
        this._kibanaUser = kibanaUser;
        this._kibanaPassword = kibanaPassword;
        this._kibanaUrlProtocol = /^https?:\/\//.exec(kibanaUrl)[0];
        this._kibanaUrl = kibanaUrl.replace(this._kibanaUrlProtocol, '');
        this._apiRootUrl = `${this._kibanaUrlProtocol}${kibanaUser}:${kibanaPassword}@${this._kibanaUrl}`
    }

    apiPathTo(path) {
        return `${this._apiRootUrl}${path}`;
    }

    async request(uri, fetchInit) {
        // FIXME: this method should throw if `response.ok` is false;
        return fetch(
            uri.startsWith("http") ? uri : this.apiPathTo(uri),
            Object.assign({
                    method: 'GET',
                    headers: {
                        ...commonHttpHeaders
                    }
                },
                fetchInit
            )
        );
    }

    /**
     * Retrieves list of Endpoint Polices
     *
     * @returns {Promise<{
     *      items: [],
     *      total: number,
     *      page: number,
     *      perPage: number
     * }>}
     */
    async fetchEndpointPolicies() {
        const response = await this.request(`${INGEST_API.PACKAGE_CONFIGS}?perPage=100&kuery=ingest-package-policies.package.name:endpoint`);
        return await response.json();
    }

    async updateEndpointPolicy({created_at, created_by, updated_at, updated_by, id, revision, ...newPackagePolicy}) {
        const response = await this.request(
            INGEST_API.PACKAGE_UPDATE.replace('{packagePolicyId}', id),
        {
                method: 'PUT',
                body: JSON.stringify(newPackagePolicy)
            }
        );
        return await response.json()
    }
}

