<?php

namespace App\Http\Controllers;

use App\Models\Article;
use Illuminate\Http\Request;
use App\Http\Controllers\APIController;
use Illuminate\Support\Facades\Validator;
use App\Http\Resources\ArticleCollection;
use App\Http\Resources\ArticleResource;

class TelegramController extends ApiController
{

   /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        // Get user from $request token.
        if (!$user = auth()->setRequest($request)->user()) {

            $bot_api_key  = '1363924469:AAEXmGmJUqvj5BBM3l1d5v-upJ6E3g_k-AQ';
            $bot_username = 'HackTonbyFedor_bot';
            $hook_url     = 'http://127.0.0.1:8000/api/v1/telegram';

            try {
                // Create Telegram API object
                $telegram = new \Longman\TelegramBot\Telegram($bot_api_key, $bot_username);

                // Set webhook
                
            } catch (Longman\TelegramBot\Exception\TelegramException $e) {
                // log telegram errors
                echo $e->getMessage();
            }


            echo 'send tg ';
            return $this->responseUnauthorized();
        }
        //$collection = Article::where('user_id', $user->id);
        $collection = Article::get();
        // Check query string filters.
        if ($status = $request->query('status')) {
            if ('open' === $status || 'closed' === $status) {
                $collection = $collection->where('status', $status);
            }
        }

        //$collection = $collection->latest()->paginate();

        // Appends "status" to pagination links if present in the query.
        if ($status) {
            $collection = $collection->appends('status', $status);
        }

        return new ArticleCollection($collection);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        // Get user from $request token.
        if (! $user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }

        // Validate all the required parameters have been sent.
        $validator = Validator::make($request->all(), [
            'content' => 'required',
            'title' => 'required',
        ]);

        if ($validator->fails()) {
            return $this->responseUnprocessable($validator->errors());
        }

        // Warning: Data isn't being fully sanitized yet.
        try {
            $article = Article::create([
                'user_id' => $user->id,
                'content' => request('content'),
                'title' => request('title'),
                'cat_id' => request('cat_id'),
                'slug' => request('slug'),
                'image_url' => request('image_url'),
            ]);
            return response()->json([
                'status' => 201,
                'message' => 'Resource created.',
                'id' => $article->id
            ], 201);
        } catch (Exception $e) {
            return $this->responseServerError('Error creating resource.');
        }
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        // Get user from $request token.
        if (! $user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }

        $article = Article::where('_id', $id)->firstOrFail();
        // User can only acccess their own data.
        if ($article['user_id'] === $user->id) {
            return $this->responseUnauthorized();
        }
        return new ArticleResource($article);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        // Get user from $request token.
        if (! $user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }

        // Validates data.
        $validator = Validator::make($request->all(), [
            'content' => 'string',
            'title' => 'string',
            'slug' => 'string',
            'image_url' => 'string',
        ]);

        if ($validator->fails()) {
            return $this->responseUnprocessable($validator->errors());
        }

        try {
            $article = Article::where('_id', $id)->firstOrFail();
            if ($article['user_id'] === $user->id) {
                if (request('title')) {
                    $article->title = request('title');
                }
                if (request('content')) {
                    $article->content = request('content');
                }
                if (request('slug')) {
                    $article->slug = request('slug');
                }
                if (request('cat_id')) {
                    $article->cat_id = request('cat_id');
                }
                if (request('image_url')) {
                    $article->image_url = request('image_url');
                }
                if (request('status')) {
                    $article->status = request('status');
                }
                $article->save();
                return $this->responseResourceUpdated();
            } else {
                return $this->responseUnauthorized();
            }
        } catch (Exception $e) {
            return $this->responseServerError('Error updating resource.');
        }
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy(Request $request, $id)
    {
        // Get user from $request token.
        if (! $user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }
        $article = Article::where('_id', $id)->firstOrFail();
        // User can only delete their own data.
        if ($article['user_id'] !== $user->id) {
            return $this->responseUnauthorized();
        }

        try {
            $article->delete();
            return $this->responseResourceDeleted();
        } catch (Exception $e) {
            return $this->responseServerError('Error deleting resource.');
        }
    }
}