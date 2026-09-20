<?php

namespace App\Http\Controllers;

use App\Models\Consultant;
use App\Models\Department;
use App\Models\Page;
use App\Models\Post;
use App\Models\Service;
use Illuminate\Http\Response;

class SitemapController extends Controller
{
    /**
     * @return array<int, string>
     */
    private function typeSitemapNames(): array
    {
        return ['services', 'departments', 'consultants', 'news', 'pages'];
    }

    public function index(): Response
    {
        $sitemaps = collect($this->typeSitemapNames())
            ->map(fn (string $type) => url('sitemap-'.$type.'.xml'));

        $xml = $this->sitemapsIndexXml($sitemaps->all());

        return $this->xmlResponse($xml);
    }

    public function services(): Response
    {
        $urls = Service::published()
            ->orderBy('slug')
            ->get(['slug', 'updated_at'])
            ->map(fn (Service $service) => [
                'loc' => url('services/'.$service->slug),
                'lastmod' => $service->updated_at?->toAtomString(),
            ])->all();

        return $this->xmlResponse($this->sitemapXml($urls));
    }

    public function departments(): Response
    {
        $urls = Department::published()
            ->orderBy('slug')
            ->get(['slug', 'updated_at'])
            ->map(fn (Department $department) => [
                'loc' => url('departments/'.$department->slug),
                'lastmod' => $department->updated_at?->toAtomString(),
            ])->all();

        return $this->xmlResponse($this->sitemapXml($urls));
    }

    public function consultants(): Response
    {
        $urls = Consultant::published()
            ->orderBy('slug')
            ->get(['slug', 'updated_at'])
            ->map(fn (Consultant $consultant) => [
                'loc' => url('consultants/'.$consultant->slug),
                'lastmod' => $consultant->updated_at?->toAtomString(),
            ])->all();

        return $this->xmlResponse($this->sitemapXml($urls));
    }

    public function news(): Response
    {
        $urls = Post::published()
            ->orderBy('slug')
            ->get(['slug', 'publish_date', 'updated_at'])
            ->map(fn (Post $post) => [
                'loc' => url('news/'.$post->slug),
                'lastmod' => ($post->publish_date ?? $post->updated_at)?->toAtomString(),
            ])->all();

        return $this->xmlResponse($this->sitemapXml($urls));
    }

    public function pages(): Response
    {
        $urls = Page::published()
            ->whereHas('template', fn ($query) => $query->where('routable', true)->whereNotNull('url_prefix'))
            ->with('template:id,key,url_prefix')
            ->orderBy('slug')
            ->get(['slug', 'updated_at', 'template_id'])
            ->map(fn (Page $page) => [
                'loc' => url($page->template->url_prefix.'/'.$page->slug),
                'lastmod' => $page->updated_at?->toAtomString(),
            ])->all();

        return $this->xmlResponse($this->sitemapXml($urls));
    }

    public function robots(): Response
    {
        $content = implode("\n", [
            'User-agent: *',
            'Disallow: /cms',
            'Disallow: /settings',
            'Disallow: /login',
            'Disallow: /register',
            'Disallow: /forgot-password',
            'Disallow: /two-factor',
            'Sitemap: '.url('sitemap.xml'),
            '',
        ]);

        return response($content, 200, ['Content-Type' => 'text/plain']);
    }

    /**
     * @param  array<int, string>  $urls
     */
    private function sitemapsIndexXml(array $urls): string
    {
        $entries = collect($urls)
            ->map(fn (string $url) => "  <sitemap>\n    <loc>{$this->xmlEncode($url)}</loc>\n  </sitemap>")
            ->implode("\n");

        return "<sitemapindex xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n{$entries}\n</sitemapindex>";
    }

    /**
     * @param  array<int, array{loc: string, lastmod: string|null}>  $urls
     */
    private function sitemapXml(array $urls): string
    {
        $entries = collect($urls)
            ->map(function (array $url) {
                $lastmod = $url['lastmod'] !== null
                    ? "\n    <lastmod>{$this->xmlEncode($url['lastmod'])}</lastmod>"
                    : '';

                return "  <url>\n    <loc>{$this->xmlEncode($url['loc'])}</loc> {$lastmod}\n  </url>";
            })
            ->implode("\n");

        return "<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n{$entries}\n</urlset>";
    }

    private function xmlResponse(string $xml): Response
    {
        return response(
            '<?xml version="1.0" encoding="UTF-8"?>'.$xml,
            200,
            ['Content-Type' => 'application/xml; charset=UTF-8'],
        );
    }

    private function xmlEncode(string $value): string
    {
        return htmlspecialchars($value, ENT_XML1 | ENT_QUOTES, 'UTF-8');
    }
}
